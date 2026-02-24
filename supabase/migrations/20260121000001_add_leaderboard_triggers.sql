-- Migration: Add triggers for auto-sync profiles to leaderboard
-- Date: 2026-01-21
-- Purpose: Keep leaderboard display data in sync with profiles changes

-- ============================================
-- TRIGGER 1: Sync profile changes to leaderboard
-- ============================================

CREATE OR REPLACE FUNCTION sync_profile_to_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  -- Update leaderboard when display_name/avatar/grade/school changes in profiles
  UPDATE public.leaderboard
  SET 
    display_name = COALESCE(NEW.display_name, 'Người chơi ẩn danh'),
    grade = COALESCE(NEW.grade, 'grade1'),
    school = NEW.school,
    avatar = COALESCE(NEW.avatar, '👤'),
    updated_at = NOW()
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS sync_profile_changes ON public.profiles;

-- Create trigger on profile UPDATE
CREATE TRIGGER sync_profile_changes
AFTER UPDATE OF display_name, grade, school, avatar ON public.profiles
FOR EACH ROW
WHEN (
  OLD.display_name IS DISTINCT FROM NEW.display_name OR
  OLD.grade IS DISTINCT FROM NEW.grade OR
  OLD.school IS DISTINCT FROM NEW.school OR
  OLD.avatar IS DISTINCT FROM NEW.avatar
)
EXECUTE FUNCTION sync_profile_to_leaderboard();

-- ============================================
-- TRIGGER 2: Create leaderboard entry for new profiles
-- ============================================

CREATE OR REPLACE FUNCTION create_leaderboard_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Create entry in leaderboard when new user registers
  INSERT INTO public.leaderboard (
    user_id, 
    points, 
    display_name, 
    grade, 
    school, 
    avatar
  )
  VALUES (
    NEW.id,
    0,
    COALESCE(NEW.display_name, 'Người chơi ẩn danh'),
    COALESCE(NEW.grade, 'grade1'),
    NEW.school,
    COALESCE(NEW.avatar, '👤')
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    display_name = COALESCE(NEW.display_name, 'Người chơi ẩn danh'),
    grade = COALESCE(NEW.grade, 'grade1'),
    school = NEW.school,
    avatar = COALESCE(NEW.avatar, '👤'),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS create_leaderboard_on_profile ON public.profiles;

-- Create trigger on profile INSERT
CREATE TRIGGER create_leaderboard_on_profile
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION create_leaderboard_entry();

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  trigger_count INT;
  function_count INT;
BEGIN
  -- Check triggers created
  SELECT COUNT(*)
  INTO trigger_count
  FROM pg_trigger
  WHERE tgname IN ('sync_profile_changes', 'create_leaderboard_on_profile');
  
  IF trigger_count != 2 THEN
    RAISE EXCEPTION 'Trigger creation failed: Found % triggers, expected 2', trigger_count;
  END IF;
  
  -- Check functions created
  SELECT COUNT(*)
  INTO function_count
  FROM pg_proc
  WHERE proname IN ('sync_profile_to_leaderboard', 'create_leaderboard_entry');
  
  IF function_count != 2 THEN
    RAISE EXCEPTION 'Function creation failed: Found % functions, expected 2', function_count;
  END IF;
  
  RAISE NOTICE 'Triggers created successfully: % triggers, % functions', trigger_count, function_count;
END $$;
