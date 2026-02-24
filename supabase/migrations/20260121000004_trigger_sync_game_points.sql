-- Migration: Add trigger to auto-sync points from game_progress to leaderboard
-- Date: 2026-01-21
-- Purpose: Automatically update leaderboard when users play games

-- ============================================
-- FUNCTION: Sync game points to leaderboard
-- ============================================

CREATE OR REPLACE FUNCTION sync_game_points_to_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  -- Update leaderboard entry for this user
  UPDATE public.leaderboard
  SET 
    points = (
      SELECT COALESCE(SUM(total_points), 0)
      FROM public.game_progress
      WHERE user_id = NEW.user_id
    ),
    normalized_grade = CASE
      WHEN NEW.grade LIKE '%preschool%' OR NEW.grade LIKE '%mam-non%' THEN 'preschool'
      WHEN NEW.grade LIKE '%grade1%' OR NEW.grade = '1' THEN 'grade1'
      WHEN NEW.grade LIKE '%grade2%' OR NEW.grade = '2' THEN 'grade2'
      WHEN NEW.grade LIKE '%grade3%' OR NEW.grade = '3' THEN 'grade3'
      WHEN NEW.grade LIKE '%grade4%' OR NEW.grade = '4' THEN 'grade4'
      WHEN NEW.grade LIKE '%grade5%' OR NEW.grade = '5' THEN 'grade5'
      ELSE COALESCE(normalized_grade, 'grade1')
    END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  -- If leaderboard entry doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO public.leaderboard (
      user_id,
      points,
      normalized_grade,
      display_name,
      avatar
    )
    SELECT 
      NEW.user_id,
      NEW.total_points,
      CASE
        WHEN NEW.grade LIKE '%preschool%' OR NEW.grade LIKE '%mam-non%' THEN 'preschool'
        WHEN NEW.grade LIKE '%grade1%' OR NEW.grade = '1' THEN 'grade1'
        WHEN NEW.grade LIKE '%grade2%' OR NEW.grade = '2' THEN 'grade2'
        WHEN NEW.grade LIKE '%grade3%' OR NEW.grade = '3' THEN 'grade3'
        WHEN NEW.grade LIKE '%grade4%' OR NEW.grade = '4' THEN 'grade4'
        WHEN NEW.grade LIKE '%grade5%' OR NEW.grade = '5' THEN 'grade5'
        ELSE 'grade1'
      END,
      COALESCE(p.display_name, 'Người chơi ẩn danh'),
      COALESCE(p.avatar, '👤')
    FROM public.profiles p
    WHERE p.id = NEW.user_id
    ON CONFLICT (user_id) DO UPDATE
    SET 
      points = EXCLUDED.points,
      normalized_grade = EXCLUDED.normalized_grade,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Update leaderboard on game_progress changes
-- ============================================

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS update_leaderboard_points ON public.game_progress;

-- Create trigger on INSERT and UPDATE
CREATE TRIGGER update_leaderboard_points
AFTER INSERT OR UPDATE OF total_points ON public.game_progress
FOR EACH ROW
EXECUTE FUNCTION sync_game_points_to_leaderboard();

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  trigger_exists BOOLEAN;
  function_exists BOOLEAN;
BEGIN
  -- Check function exists
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'sync_game_points_to_leaderboard'
  ) INTO function_exists;
  
  -- Check trigger exists
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_leaderboard_points'
  ) INTO trigger_exists;
  
  IF function_exists AND trigger_exists THEN
    RAISE NOTICE '✅ Trigger created successfully';
    RAISE NOTICE 'Function: sync_game_points_to_leaderboard()';
    RAISE NOTICE 'Trigger: update_leaderboard_points on game_progress';
  ELSE
    RAISE EXCEPTION 'Trigger creation failed!';
  END IF;
END $$;
