
-- =============================================
-- Dọn dẹp bảng leaderboard dư thừa
-- Bảng này không được đọc bởi frontend (RPC get_leaderboard query game_globals + profiles trực tiếp)
-- =============================================

-- 1. Xóa trigger sync_globals_to_leaderboard trên game_globals
DROP TRIGGER IF EXISTS sync_globals_to_leaderboard ON public.game_globals;

-- 2. Xóa function sync_globals_to_leaderboard
DROP FUNCTION IF EXISTS public.sync_globals_to_leaderboard();

-- 3. Xóa trigger set_updated_at_leaderboard trên leaderboard
DROP TRIGGER IF EXISTS set_updated_at_leaderboard ON public.leaderboard;

-- 4. Cập nhật handle_new_user() để không insert vào leaderboard nữa
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
  
  -- Insert initial game progress (legacy, kept for compatibility)
  INSERT INTO public.game_progress (user_id)
  VALUES (new.id);
  
  -- Insert initial streak record
  INSERT INTO public.user_streaks (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$function$;

-- 5. Cập nhật get_user_progress() để không reference leaderboard
CREATE OR REPLACE FUNCTION public.get_user_progress()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- 6. Xóa bảng leaderboard
DROP TABLE IF EXISTS public.leaderboard;
