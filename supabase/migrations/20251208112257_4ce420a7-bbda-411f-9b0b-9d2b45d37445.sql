-- 1. Thêm cột accuracy vào stage_history nếu chưa có
ALTER TABLE public.stage_history ADD COLUMN IF NOT EXISTS accuracy numeric DEFAULT 0;

-- 2. Thêm cột grade vào game_progress nếu chưa có
-- Đầu tiên drop unique constraint cũ nếu có
DO $$ 
BEGIN
    -- Drop existing constraints that might conflict
    ALTER TABLE public.game_progress DROP CONSTRAINT IF EXISTS game_progress_user_id_key;
    ALTER TABLE public.game_progress DROP CONSTRAINT IF EXISTS game_progress_user_id_grade_key;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Constraint not found, continuing...';
END $$;

-- Thêm cột grade
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS grade text DEFAULT 'grade2-trangquynh';

-- Thêm unique constraint cho user_id + grade
ALTER TABLE public.game_progress ADD CONSTRAINT game_progress_user_id_grade_key UNIQUE (user_id, grade);

-- 3. Thêm cột last_played_at vào game_progress
ALTER TABLE public.game_progress ADD COLUMN IF NOT EXISTS last_played_at timestamp with time zone DEFAULT now();

-- 4. Thêm cột attempts vào user_best_scores nếu chưa có  
ALTER TABLE public.user_best_scores ADD COLUMN IF NOT EXISTS attempts integer DEFAULT 1;

-- 5. Cập nhật lại function complete_stage để hoạt động đúng
CREATE OR REPLACE FUNCTION public.complete_stage(
    p_stage_id text, 
    p_course_id text, 
    p_score integer, 
    p_max_score integer, 
    p_correct_answers integer, 
    p_total_questions integer, 
    p_time_spent_seconds integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_user_id UUID;
    v_old_xp INTEGER;
    v_new_xp INTEGER;
    v_xp_earned INTEGER;
    v_old_level INTEGER;
    v_new_level INTEGER;
    v_is_new_best BOOLEAN := FALSE;
    v_accuracy FLOAT;
    v_completed BOOLEAN;
    v_attempt_number INTEGER := 1;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'User not authenticated');
    END IF;
    
    -- Tính độ chính xác (tránh chia cho 0)
    IF p_total_questions = 0 THEN
        v_accuracy := 0;
    ELSE
        v_accuracy := (p_correct_answers::FLOAT / p_total_questions::FLOAT) * 100;
    END IF;
    
    v_xp_earned := p_score; 
    v_completed := v_accuracy >= 50;

    -- 1. Lưu lịch sử chơi
    INSERT INTO public.stage_history (
        user_id, stage_id, course_id, score, max_score, 
        correct_answers, total_questions, accuracy, 
        time_spent_seconds, xp_earned, completed
    )
    VALUES (
        v_user_id, p_stage_id, p_course_id, p_score, p_max_score,
        p_correct_answers, p_total_questions, v_accuracy,
        p_time_spent_seconds, v_xp_earned, v_completed
    );

    -- 2. Cập nhật/tạo điểm cao nhất
    INSERT INTO public.user_best_scores (
        user_id, stage_id, course_id, best_score, best_accuracy, 
        total_attempts, last_played_at
    )
    VALUES (
        v_user_id, p_stage_id, p_course_id, p_score, v_accuracy, 
        1, NOW()
    )
    ON CONFLICT (user_id, stage_id, course_id) 
    DO UPDATE SET 
        best_score = GREATEST(public.user_best_scores.best_score, EXCLUDED.best_score),
        best_accuracy = GREATEST(public.user_best_scores.best_accuracy, EXCLUDED.best_accuracy),
        total_attempts = public.user_best_scores.total_attempts + 1,
        last_played_at = NOW()
    RETURNING total_attempts, (best_score = p_score) INTO v_attempt_number, v_is_new_best;

    -- 3. Tìm hoặc tạo game_progress theo grade
    INSERT INTO public.game_progress (user_id, grade, total_xp, level, points)
    VALUES (v_user_id, p_course_id, 0, 1, 0)
    ON CONFLICT (user_id, grade) DO NOTHING;
    
    -- Lấy XP và level hiện tại
    SELECT COALESCE(total_xp, 0), COALESCE(level, 1) 
    INTO v_old_xp, v_old_level 
    FROM public.game_progress 
    WHERE user_id = v_user_id AND grade = p_course_id;

    v_new_xp := v_old_xp + v_xp_earned;
    v_new_level := GREATEST(1, FLOOR(SQRT(v_new_xp::numeric / 100)) + 1)::integer;

    -- 4. Cập nhật game_progress
    UPDATE public.game_progress 
    SET 
        total_xp = v_new_xp,
        points = COALESCE(points, 0) + p_score,
        level = v_new_level,
        completed_nodes = CASE 
            WHEN v_completed AND NOT (completed_nodes::text[] @> ARRAY[p_stage_id]) 
            THEN array_to_json(array_append(COALESCE(completed_nodes::text[], ARRAY[]::text[]), p_stage_id))::jsonb
            ELSE completed_nodes 
        END,
        last_played_at = NOW(),
        updated_at = NOW()
    WHERE user_id = v_user_id AND grade = p_course_id;

    -- 5. Cập nhật leaderboard
    INSERT INTO public.leaderboard (user_id, points)
    VALUES (v_user_id, p_score)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        points = public.leaderboard.points + EXCLUDED.points,
        updated_at = NOW();

    RETURN jsonb_build_object(
        'success', TRUE,
        'xp_earned', v_xp_earned,
        'total_xp', v_new_xp,
        'new_level', v_new_level,
        'level_up', (v_new_level > v_old_level),
        'completed', v_completed,
        'accuracy', v_accuracy,
        'is_new_best', COALESCE(v_is_new_best, FALSE),
        'attempt_number', COALESCE(v_attempt_number, 1)
    );
END;
$$;

-- 6. Tạo function để lấy leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard(
    p_grade text DEFAULT NULL,
    p_period text DEFAULT 'week',
    p_limit integer DEFAULT 10
)
RETURNS TABLE (
    rank bigint,
    user_id uuid,
    display_name text,
    avatar text,
    school text,
    grade text,
    total_points bigint,
    total_xp bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_start_date timestamp with time zone;
BEGIN
    -- Xác định khoảng thời gian
    CASE p_period
        WHEN 'week' THEN v_start_date := date_trunc('week', NOW());
        WHEN 'month' THEN v_start_date := date_trunc('month', NOW());
        WHEN 'year' THEN v_start_date := date_trunc('year', NOW());
        ELSE v_start_date := '1970-01-01'::timestamp with time zone;
    END CASE;

    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(sh.score), 0) DESC) as rank,
        gp.user_id,
        p.display_name,
        p.avatar,
        p.school,
        COALESCE(p.grade, gp.grade) as grade,
        COALESCE(SUM(sh.score), 0)::bigint as total_points,
        COALESCE(MAX(gp.total_xp), 0)::bigint as total_xp
    FROM public.game_progress gp
    JOIN public.profiles p ON p.id = gp.user_id
    LEFT JOIN public.stage_history sh ON sh.user_id = gp.user_id 
        AND sh.created_at >= v_start_date
        AND (p_grade IS NULL OR sh.course_id = p_grade)
    WHERE (p_grade IS NULL OR gp.grade = p_grade)
    GROUP BY gp.user_id, p.display_name, p.avatar, p.school, p.grade, gp.grade
    ORDER BY total_points DESC
    LIMIT p_limit;
END;
$$;

-- 7. Cập nhật RLS cho user_best_scores để cho phép INSERT và UPDATE
DROP POLICY IF EXISTS "Users can upsert own best scores" ON public.user_best_scores;
CREATE POLICY "Users can upsert own best scores" 
ON public.user_best_scores 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);