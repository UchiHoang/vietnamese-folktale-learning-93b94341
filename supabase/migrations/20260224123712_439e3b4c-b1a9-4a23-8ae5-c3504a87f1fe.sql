
-- =============================================
-- STEP 1: Drop old triggers on profiles & game_progress
-- =============================================
DROP TRIGGER IF EXISTS sync_profile_to_leaderboard ON public.profiles;
DROP TRIGGER IF EXISTS create_leaderboard_on_profile ON public.profiles;
DROP TRIGGER IF EXISTS update_leaderboard_points ON public.game_progress;

-- =============================================
-- STEP 2: Drop old functions
-- =============================================
DROP FUNCTION IF EXISTS public.sync_profile_to_leaderboard() CASCADE;
DROP FUNCTION IF EXISTS public.create_leaderboard_entry() CASCADE;
DROP FUNCTION IF EXISTS public.sync_game_points_to_leaderboard() CASCADE;

-- =============================================
-- STEP 3: Drop redundant columns from leaderboard
-- =============================================
ALTER TABLE public.leaderboard
  DROP COLUMN IF EXISTS display_name,
  DROP COLUMN IF EXISTS avatar,
  DROP COLUMN IF EXISTS school,
  DROP COLUMN IF EXISTS grade,
  DROP COLUMN IF EXISTS normalized_grade,
  DROP COLUMN IF EXISTS rank;

-- =============================================
-- STEP 4: Sync leaderboard.points = game_globals.total_xp
-- =============================================
UPDATE public.leaderboard lb
SET points = COALESCE(gg.total_xp, 0),
    updated_at = NOW()
FROM public.game_globals gg
WHERE lb.user_id = gg.user_id;

-- =============================================
-- STEP 5: Create trigger to auto-sync points from game_globals
-- =============================================
CREATE OR REPLACE FUNCTION public.sync_globals_to_leaderboard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.leaderboard
  SET points = NEW.total_xp,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;

  -- Create if not exists
  IF NOT FOUND THEN
    INSERT INTO public.leaderboard (user_id, points)
    VALUES (NEW.user_id, NEW.total_xp)
    ON CONFLICT (user_id) DO UPDATE
    SET points = EXCLUDED.points, updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_globals_to_leaderboard
AFTER INSERT OR UPDATE OF total_xp ON public.game_globals
FOR EACH ROW
EXECUTE FUNCTION public.sync_globals_to_leaderboard();

-- =============================================
-- STEP 6: Drop old get_leaderboard, create get_leaderboard_v2
-- (also keep old name as alias for compatibility)
-- =============================================
DROP FUNCTION IF EXISTS public.get_leaderboard(text, text, integer);

CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_grade text DEFAULT NULL,
  p_period text DEFAULT 'all',
  p_limit integer DEFAULT 10
)
RETURNS TABLE(
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
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_start_date timestamp with time zone;
BEGIN
  -- Determine time window
  CASE p_period
    WHEN 'week'  THEN v_start_date := date_trunc('week', NOW());
    WHEN 'month' THEN v_start_date := date_trunc('month', NOW());
    WHEN 'year'  THEN v_start_date := date_trunc('year', NOW());
    ELSE v_start_date := '1970-01-01'::timestamp with time zone; -- 'all'
  END CASE;

  IF p_grade IS NULL THEN
    -- GLOBAL leaderboard: rank by game_globals.total_xp
    -- Time filter: only count XP earned within the period via level_history
    IF p_period = 'all' THEN
      -- All time: just use game_globals.total_xp directly
      RETURN QUERY
      SELECT
        ROW_NUMBER() OVER (ORDER BY gg.total_xp DESC) as rank,
        gg.user_id,
        p.display_name,
        p.avatar,
        p.school,
        p.grade,
        gg.total_xp::bigint as total_points,
        gg.total_xp::bigint as total_xp
      FROM public.game_globals gg
      JOIN public.profiles p ON p.id = gg.user_id
      WHERE gg.total_xp > 0
      ORDER BY gg.total_xp DESC
      LIMIT p_limit;
    ELSE
      -- Time-filtered: sum score from level_history within period
      RETURN QUERY
      SELECT
        ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(lh.score), 0) DESC) as rank,
        p.id as user_id,
        p.display_name,
        p.avatar,
        p.school,
        p.grade,
        COALESCE(SUM(lh.score), 0)::bigint as total_points,
        COALESCE(SUM(lh.score), 0)::bigint as total_xp
      FROM public.profiles p
      JOIN public.level_history lh ON lh.user_id = p.id
        AND lh.created_at >= v_start_date
      GROUP BY p.id, p.display_name, p.avatar, p.school, p.grade
      HAVING SUM(lh.score) > 0
      ORDER BY total_points DESC
      LIMIT p_limit;
    END IF;
  ELSE
    -- GRADE-SPECIFIC leaderboard: sum score from level_history for matching course_id
    RETURN QUERY
    SELECT
      ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(lh.score), 0) DESC) as rank,
      p.id as user_id,
      p.display_name,
      p.avatar,
      p.school,
      p.grade,
      COALESCE(SUM(lh.score), 0)::bigint as total_points,
      COALESCE(SUM(lh.score), 0)::bigint as total_xp
    FROM public.profiles p
    JOIN public.level_history lh ON lh.user_id = p.id
      AND lh.course_id LIKE p_grade || '%'
      AND lh.created_at >= v_start_date
    GROUP BY p.id, p.display_name, p.avatar, p.school, p.grade
    HAVING SUM(lh.score) > 0
    ORDER BY total_points DESC
    LIMIT p_limit;
  END IF;
END;
$$;

-- =============================================
-- STEP 7: Update handle_new_user to not insert redundant columns
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role app_role;
BEGIN
  user_role := COALESCE(
    (new.raw_user_meta_data->>'role')::app_role,
    'student'::app_role
  );
  
  IF user_role::text = 'teacher' THEN
    user_role := 'admin'::app_role;
  END IF;
  
  -- Insert into profiles with email
  INSERT INTO public.profiles (id, display_name, avatar, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar', '👤'),
    new.email
  );
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);
  
  -- Insert initial game progress (legacy, kept for compatibility)
  INSERT INTO public.game_progress (user_id)
  VALUES (new.id);
  
  -- Insert initial leaderboard entry (simplified - just user_id and points)
  INSERT INTO public.leaderboard (user_id, points)
  VALUES (new.id, 0);
  
  -- Insert initial streak record
  INSERT INTO public.user_streaks (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

-- =============================================
-- STEP 8: Update get_user_progress to not reference dropped columns
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_progress()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_progress record;
  v_streak record;
  v_globals record;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT *
  INTO v_progress
  FROM public.game_progress
  WHERE user_id = v_user_id
  ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
  LIMIT 1;

  SELECT *
  INTO v_streak
  FROM public.user_streaks
  WHERE user_id = v_user_id;

  SELECT *
  INTO v_globals
  FROM public.game_globals
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'xp', COALESCE(v_globals.total_xp, COALESCE(v_progress.total_xp, 0)),
    'points', COALESCE(v_progress.total_points, 0),
    'level', COALESCE(v_globals.global_level, COALESCE(v_progress.level, 1)),
    'current_node', COALESCE(v_progress.current_node, 0),
    'completed_nodes', COALESCE(v_progress.completed_nodes, '[]'::jsonb),
    'earned_badges', COALESCE(v_progress.earned_badges, '[]'::jsonb),
    'streak', jsonb_build_object(
      'current', COALESCE(v_streak.current_streak, 0),
      'longest', COALESCE(v_streak.longest_streak, 0),
      'total_days', COALESCE(v_streak.total_learning_days, 0)
    ),
    'leaderboard_points', COALESCE(v_globals.total_xp, 0),
    'leaderboard_rank', NULL
  );
END;
$$;

-- =============================================
-- STEP 9: Add RLS policy for level_history to allow leaderboard reads
-- =============================================
CREATE POLICY "leaderboard_read_level_history"
ON public.level_history
FOR SELECT
USING (true);
