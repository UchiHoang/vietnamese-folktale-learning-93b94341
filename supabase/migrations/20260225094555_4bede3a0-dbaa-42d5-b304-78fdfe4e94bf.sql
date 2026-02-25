
-- Update complete_stage to also upsert daily_activity
CREATE OR REPLACE FUNCTION public.complete_stage(p_course_id text, p_node_index integer, p_score numeric, p_stars integer, p_xp_reward integer, p_game_specific_data jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_new_total_xp BIGINT;
  v_old_total_xp BIGINT := 0;
  v_new_level INT;
  v_current_level INT;
  v_needed_xp INT := 100;
  v_cp_id UUID;
  v_old_current_node INT;
  v_new_current_node INT;
  v_completed_nodes JSONB;
  v_total_stars INT;
  v_course_total_xp INT;
  v_extra_data JSONB;
  v_passed BOOLEAN := (p_stars > 0);
  v_duration INT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  v_duration := COALESCE((p_game_specific_data->>'timeSpent')::INT, 0);

  -- Đảm bảo có row trong game_globals
  INSERT INTO public.game_globals(user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Lấy XP hiện tại (global)
  SELECT COALESCE(total_xp, 0), COALESCE(global_level, 1)
  INTO v_old_total_xp, v_current_level
  FROM public.game_globals
  WHERE user_id = v_user_id;

  -- Cập nhật Global XP và Coin
  UPDATE public.game_globals
  SET 
    total_xp = total_xp + p_xp_reward,
    coins = coins + p_stars,
    updated_at = NOW()
  WHERE user_id = v_user_id
  RETURNING total_xp, global_level INTO v_new_total_xp, v_current_level;

  -- Tính level mới
  v_new_level := GREATEST(1, CEIL(v_new_total_xp::NUMERIC / v_needed_xp));

  IF v_new_level > v_current_level THEN
    UPDATE public.game_globals
    SET global_level = v_new_level, updated_at = NOW()
    WHERE user_id = v_user_id;
  END IF;

  -- Lấy course_progress hiện tại
  SELECT id, current_node, completed_nodes, total_stars, COALESCE(total_xp, 0), extra_data
  INTO v_cp_id, v_old_current_node, v_completed_nodes, v_total_stars, v_course_total_xp, v_extra_data
  FROM public.course_progress
  WHERE user_id = v_user_id AND course_id = p_course_id;

  IF v_cp_id IS NULL THEN
    v_old_current_node := 0;
    v_completed_nodes := '[]'::jsonb;
    v_total_stars := 0;
    v_course_total_xp := 0;
    v_extra_data := '{}'::jsonb;
  END IF;

  v_course_total_xp := v_course_total_xp + p_xp_reward;

  IF v_passed THEN
    v_new_current_node := GREATEST(v_old_current_node, p_node_index + 1);
  ELSE
    v_new_current_node := v_old_current_node;
  END IF;

  IF v_passed THEN
    IF v_completed_nodes IS NULL OR v_completed_nodes = 'null'::jsonb THEN
      v_completed_nodes := jsonb_build_array(p_node_index);
    ELSIF NOT (v_completed_nodes @> jsonb_build_array(p_node_index)) THEN
      v_completed_nodes := v_completed_nodes || jsonb_build_array(p_node_index);
    END IF;
  END IF;

  -- Upsert course_progress
  INSERT INTO public.course_progress(user_id, course_id, current_node, completed_nodes, total_stars, total_xp, extra_data)
  VALUES (v_user_id, p_course_id, v_new_current_node,
    CASE WHEN v_passed THEN jsonb_build_array(p_node_index) ELSE '[]'::jsonb END,
    p_stars, p_xp_reward, COALESCE(p_game_specific_data, '{}'::jsonb))
  ON CONFLICT (user_id, course_id) DO UPDATE
  SET
    current_node = CASE 
      WHEN EXCLUDED.total_stars > 0 THEN GREATEST(course_progress.current_node, p_node_index + 1)
      ELSE course_progress.current_node
    END,
    completed_nodes = (
      SELECT jsonb_agg(DISTINCT value ORDER BY value)
      FROM jsonb_array_elements(
        COALESCE(NULLIF(course_progress.completed_nodes, 'null'::jsonb), '[]'::jsonb) || EXCLUDED.completed_nodes
      )
    ),
    total_stars = course_progress.total_stars + EXCLUDED.total_stars,
    total_xp = course_progress.total_xp + EXCLUDED.total_xp,
    extra_data = course_progress.extra_data || EXCLUDED.extra_data,
    updated_at = NOW()
  RETURNING id, current_node, completed_nodes, total_stars, total_xp, extra_data
  INTO v_cp_id, v_old_current_node, v_completed_nodes, v_total_stars, v_course_total_xp, v_extra_data;

  -- Lưu lịch sử
  INSERT INTO public.level_history(user_id, course_id, node_index, score, stars, duration_seconds, passed, meta)
  VALUES (v_user_id, p_course_id, p_node_index, p_score, p_stars, v_duration, v_passed, p_game_specific_data);

  -- === AUTO UPDATE daily_activity ===
  INSERT INTO public.daily_activity (user_id, activity_date, xp_earned, points_earned, lessons_completed, time_spent_minutes)
  VALUES (v_user_id, CURRENT_DATE, p_xp_reward, p_score::int, 1, GREATEST(1, v_duration / 60))
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET
    xp_earned = daily_activity.xp_earned + EXCLUDED.xp_earned,
    points_earned = daily_activity.points_earned + EXCLUDED.points_earned,
    lessons_completed = daily_activity.lessons_completed + 1,
    time_spent_minutes = daily_activity.time_spent_minutes + EXCLUDED.time_spent_minutes;

  -- Update streak
  PERFORM public.update_user_streak(v_user_id);

  RETURN jsonb_build_object(
    'success', true,
    'globals', jsonb_build_object(
      'total_xp', v_new_total_xp,
      'global_level', v_new_level,
      'coins', (SELECT coins FROM public.game_globals WHERE user_id = v_user_id)
    ),
    'course', jsonb_build_object(
      'course_id', p_course_id,
      'current_node', v_old_current_node,
      'completed_nodes', v_completed_nodes,
      'total_stars', v_total_stars,
      'total_xp', v_course_total_xp,
      'extra_data', v_extra_data
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- Update complete_stage_grade5 to also upsert daily_activity
CREATE OR REPLACE FUNCTION public.complete_stage_grade5(p_stage_id text, p_course_id text, p_score integer, p_max_score integer, p_correct_answers integer, p_total_questions integer, p_time_spent_seconds integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user_id UUID;
  v_current_xp INTEGER;
  v_current_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_accuracy NUMERIC;
  v_is_new_best BOOLEAN;
  v_attempt_number INTEGER;
  v_xp_earned INTEGER;
  v_level_up BOOLEAN;
  v_badge_earned TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  SELECT COALESCE(total_xp, 0), COALESCE(level, 1)
  INTO v_current_xp, v_current_level
  FROM public."progressGrade5"
  WHERE user_id = v_user_id;

  v_accuracy := (p_correct_answers::NUMERIC / p_total_questions::NUMERIC) * 100;
  
  v_xp_earned := p_correct_answers * 10;
  IF v_accuracy = 100 THEN
    v_xp_earned := v_xp_earned + 20;
  ELSIF v_accuracy >= 80 THEN
    v_xp_earned := v_xp_earned + 10;
  END IF;

  v_new_xp := v_current_xp + v_xp_earned;
  v_new_level := FLOOR(v_new_xp / 100) + 1;
  v_level_up := v_new_level > v_current_level;

  INSERT INTO public.user_best_scores (user_id, course_id, stage_id, best_score, best_accuracy, best_time_seconds, last_played_at)
  VALUES (v_user_id, p_course_id, p_stage_id, p_score, v_accuracy, p_time_spent_seconds, NOW())
  ON CONFLICT (user_id, course_id, stage_id)
  DO UPDATE SET
    best_score = GREATEST(user_best_scores.best_score, p_score),
    best_accuracy = GREATEST(user_best_scores.best_accuracy, v_accuracy),
    best_time_seconds = LEAST(user_best_scores.best_time_seconds, p_time_spent_seconds),
    last_played_at = NOW()
  RETURNING (user_best_scores.best_score < p_score OR user_best_scores.best_accuracy < v_accuracy) INTO v_is_new_best;

  INSERT INTO public."progressGrade5" (user_id, total_xp, total_points, level, current_node, completed_nodes, updated_at)
  VALUES (v_user_id, v_new_xp, COALESCE((SELECT total_points FROM public."progressGrade5" WHERE user_id = v_user_id), 0) + p_score, v_new_level, 0, ARRAY[p_stage_id], NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_xp = EXCLUDED.total_xp,
    total_points = public."progressGrade5".total_points + p_score,
    level = EXCLUDED.level,
    completed_nodes = CASE 
      WHEN NOT public."progressGrade5".completed_nodes @> ARRAY[p_stage_id] 
      THEN public."progressGrade5".completed_nodes || p_stage_id
      ELSE public."progressGrade5".completed_nodes
    END,
    updated_at = NOW();

  INSERT INTO public.stage_history (user_id, course_id, stage_id, score, max_score, correct_answers, total_questions, time_spent_seconds, accuracy, xp_earned)
  VALUES (v_user_id, p_course_id, p_stage_id, p_score, p_max_score, p_correct_answers, p_total_questions, p_time_spent_seconds, v_accuracy, v_xp_earned);

  -- === AUTO UPDATE daily_activity ===
  INSERT INTO public.daily_activity (user_id, activity_date, xp_earned, points_earned, lessons_completed, time_spent_minutes)
  VALUES (v_user_id, CURRENT_DATE, v_xp_earned, p_score, 1, GREATEST(1, p_time_spent_seconds / 60))
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET
    xp_earned = daily_activity.xp_earned + EXCLUDED.xp_earned,
    points_earned = daily_activity.points_earned + EXCLUDED.points_earned,
    lessons_completed = daily_activity.lessons_completed + 1,
    time_spent_minutes = daily_activity.time_spent_minutes + EXCLUDED.time_spent_minutes;

  -- Update streak
  PERFORM public.update_user_streak(v_user_id);

  RETURN json_build_object(
    'success', true,
    'xp_earned', v_xp_earned,
    'total_xp', v_new_xp,
    'new_level', v_new_level,
    'level_up', v_level_up,
    'completed', true,
    'accuracy', v_accuracy,
    'is_new_best', COALESCE(v_is_new_best, false),
    'attempt_number', 1,
    'badge_earned', NULL
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- Ensure unique constraint on (user_id, activity_date) for upsert to work
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_activity_user_date_unique'
  ) THEN
    ALTER TABLE public.daily_activity ADD CONSTRAINT daily_activity_user_date_unique UNIQUE (user_id, activity_date);
  END IF;
END $$;
