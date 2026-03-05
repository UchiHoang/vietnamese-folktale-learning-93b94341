
-- Drop legacy/unused tables
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.stage_history CASCADE;
DROP TABLE IF EXISTS public.user_best_scores CASCADE;
DROP TABLE IF EXISTS public.game_progress CASCADE;

-- Update handle_new_user() to remove game_progress insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Insert initial streak record
  INSERT INTO public.user_streaks (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$function$;

-- Update get_user_progress() to remove game_progress references
CREATE OR REPLACE FUNCTION public.get_user_progress()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_streak record;
  v_globals record;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT *
  INTO v_streak
  FROM public.user_streaks
  WHERE user_id = v_user_id;

  SELECT *
  INTO v_globals
  FROM public.game_globals
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'xp', COALESCE(v_globals.total_xp, 0),
    'points', 0,
    'level', COALESCE(v_globals.global_level, 1),
    'current_node', 0,
    'completed_nodes', '[]'::jsonb,
    'earned_badges', '[]'::jsonb,
    'streak', jsonb_build_object(
      'current', COALESCE(v_streak.current_streak, 0),
      'longest', COALESCE(v_streak.longest_streak, 0),
      'total_days', COALESCE(v_streak.total_learning_days, 0)
    ),
    'leaderboard_points', COALESCE(v_globals.total_xp, 0),
    'leaderboard_rank', NULL
  );
END;
$function$;
