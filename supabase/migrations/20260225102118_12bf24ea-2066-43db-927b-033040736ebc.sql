
-- Drop existing unlock_badge function
DROP FUNCTION IF EXISTS public.unlock_badge(text, text, text, text);

-- Recreate unlock_badge to write to user_achievements instead of user_badges
CREATE OR REPLACE FUNCTION public.unlock_badge(
  p_badge_id text,
  p_badge_name text,
  p_badge_description text,
  p_badge_icon text
)
RETURNS TABLE(
  success boolean,
  already_earned boolean,
  badge_id text,
  earned_at timestamp with time zone,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_existing RECORD;
  v_earned_at TIMESTAMPTZ;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Check if achievement already earned
  SELECT * INTO v_existing
  FROM user_achievements
  WHERE user_id = v_user_id AND achievement_id = p_badge_id;
  
  IF FOUND THEN
    RETURN QUERY SELECT
      TRUE::boolean as success,
      TRUE::boolean as already_earned,
      p_badge_id as badge_id,
      v_existing.earned_at as earned_at,
      'Badge đã được nhận trước đó'::TEXT as message;
  ELSE
    -- Insert into user_achievements
    INSERT INTO user_achievements (
      user_id,
      achievement_id,
      achievement_name,
      achievement_description,
      achievement_icon
    )
    VALUES (
      v_user_id,
      p_badge_id,
      p_badge_name,
      p_badge_description,
      p_badge_icon
    )
    RETURNING user_achievements.earned_at INTO v_earned_at;
    
    RETURN QUERY SELECT
      TRUE::boolean as success,
      FALSE::boolean as already_earned,
      p_badge_id as badge_id,
      v_earned_at as earned_at,
      'Badge mới đã được mở khóa!'::TEXT as message;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in unlock_badge: %', SQLERRM;
    RETURN QUERY SELECT
      FALSE::boolean as success,
      FALSE::boolean as already_earned,
      p_badge_id as badge_id,
      NOW() as earned_at,
      ('Lỗi khi mở khóa badge: ' || SQLERRM)::TEXT as message;
END;
$$;
