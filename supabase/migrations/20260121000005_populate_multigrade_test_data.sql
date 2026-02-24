-- Migration: Populate multi-grade test data for leaderboard
-- Date: 2026-01-21
-- Purpose: Add test users for Preschool, Grade 1, 3, 4, 5 to enable all grade filters

-- ============================================
-- STEP 1: Use existing profiles (no new profiles needed)
-- ============================================
-- Note: profiles table has FK to auth.users, so we can't create arbitrary profiles
-- Instead, we'll use existing 16 users and add game_progress for multiple grades

-- ============================================
-- STEP 2: Insert game_progress for PRESCHOOL
-- ============================================

INSERT INTO public.game_progress (user_id, grade, total_points, total_xp, points, level, current_node, completed_nodes)
VALUES
  -- Existing users playing preschool
  ('7808a6dd-cf75-4daf-bf14-fbad47d2b810', 'preschool-colors', 450, 450, 0, 5, 10, '[]'),
  ('5b6cbbb7-4d3d-4c7c-ad89-ec2648b7e2d1', 'preschool-numbers', 280, 280, 0, 3, 6, '[]'),
  ('13cd7474-c007-460b-a5cd-cba71af1738c', 'preschool-animals', 180, 180, 0, 2, 4, '[]'),
  ('9d14f28a-1e9c-4c5e-96c3-51b5831684d0', 'preschool-shapes', 90, 90, 0, 1, 2, '[]')
ON CONFLICT (user_id, grade) DO NOTHING;

-- ============================================
-- STEP 3: Insert game_progress for GRADE 1
-- ============================================

INSERT INTO public.game_progress (user_id, grade, total_points, total_xp, points, level, current_node, completed_nodes)
VALUES
  -- Existing users playing grade1
  ('67e325b3-6869-4e30-9feb-c26703692943', 'grade1-number-adventure', 480, 480, 0, 5, 12, '[]'),
  ('81b890b1-3b96-4a1a-8779-2b54362a8659', 'grade1-alphabet', 350, 350, 0, 4, 9, '[]'),
  ('77167b72-54db-4e25-aad4-d058b77fbc9f', 'grade1-counting', 200, 200, 0, 2, 5, '[]'),
  ('7eabbfff-aac3-483d-bfd9-dd6037e88611', 'grade1-shapes', 120, 120, 0, 2, 3, '[]'),
  ('5b388bd5-b517-4415-8a24-18358de2a825', 'grade1-reading', 80, 80, 0, 1, 2, '[]')
ON CONFLICT (user_id, grade) DO NOTHING;

-- ============================================
-- STEP 4: Insert game_progress for GRADE 3
-- ============================================

INSERT INTO public.game_progress (user_id, grade, total_points, total_xp, points, level, current_node, completed_nodes)
VALUES
  -- Existing users playing grade3
  ('9dcb3b89-2059-4e19-8db7-f08b18a66a07', 'grade3-trangquynh', 420, 420, 0, 5, 10, '[]'),
  ('e6e55c1c-0ef5-4f00-84fd-f34e39e777a3', 'grade3-math', 310, 310, 0, 4, 8, '[]'),
  ('0403c3e7-6fa6-47c1-9da4-15849b4b9fa2', 'grade3-science', 260, 260, 0, 3, 6, '[]'),
  ('5b6cbbb7-4d3d-4c7c-ad89-ec2648b7e2d1', 'grade3-vietnamese', 150, 150, 0, 2, 4, '[]')
ON CONFLICT (user_id, grade) DO NOTHING;

-- ============================================
-- STEP 5: Insert game_progress for GRADE 4
-- ============================================

INSERT INTO public.game_progress (user_id, grade, total_points, total_xp, points, level, current_node, completed_nodes)
VALUES
  -- Existing users playing grade4
  ('13cd7474-c007-460b-a5cd-cba71af1738c', 'grade4-geometry', 390, 390, 0, 4, 9, '[]'),
  ('9d14f28a-1e9c-4c5e-96c3-51b5831684d0', 'grade4-literature', 270, 270, 0, 3, 7, '[]'),
  ('67e325b3-6869-4e30-9feb-c26703692943', 'grade4-history', 180, 180, 0, 2, 5, '[]'),
  ('81b890b1-3b96-4a1a-8779-2b54362a8659', 'grade4-geography', 110, 110, 0, 1, 3, '[]')
ON CONFLICT (user_id, grade) DO NOTHING;

-- ============================================
-- STEP 6: Insert game_progress for GRADE 5
-- ============================================

INSERT INTO public.game_progress (user_id, grade, total_points, total_xp, points, level, current_node, completed_nodes)
VALUES
  -- Existing users playing grade5
  ('7808a6dd-cf75-4daf-bf14-fbad47d2b810', 'grade5-advanced-math', 500, 500, 0, 5, 12, '[]'),
  ('5b388bd5-b517-4415-8a24-18358de2a825', 'grade5-english', 380, 380, 0, 4, 10, '[]'),
  ('77167b72-54db-4e25-aad4-d058b77fbc9f', 'grade5-science', 290, 290, 0, 3, 7, '[]'),
  ('7eabbfff-aac3-483d-bfd9-dd6037e88611', 'grade5-physics', 220, 220, 0, 2, 5, '[]')
ON CONFLICT (user_id, grade) DO NOTHING;

-- ============================================
-- STEP 7: Update game_globals with cumulative XP
-- ============================================

-- Calculate and update total_xp for all users from their game_progress
INSERT INTO public.game_globals (user_id, total_xp, coins, global_level)
SELECT 
  gp.user_id,
  SUM(gp.total_xp) as total_xp,
  FLOOR(SUM(gp.total_xp) / 50) as coins,
  FLOOR(SUM(gp.total_xp) / 100) as global_level
FROM public.game_progress gp
GROUP BY gp.user_id
ON CONFLICT (user_id) DO UPDATE
SET 
  total_xp = EXCLUDED.total_xp,
  coins = EXCLUDED.coins,
  global_level = EXCLUDED.global_level,
  updated_at = NOW();

-- ============================================
-- STEP 8: Trigger will auto-update leaderboard
-- ============================================
-- The existing trigger `update_leaderboard_points` on game_progress
-- will automatically sync points and normalized_grade to leaderboard

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  r RECORD;
  total_new_profiles INT;
  total_new_progress INT;
BEGIN
  RAISE NOTICE '=== MULTI-GRADE DATA POPULATION ===';
  RAISE NOTICE 'Using existing users (no new profiles created)';
  
  -- Check grade distribution in leaderboard
  RAISE NOTICE '';
  RAISE NOTICE 'Grade distribution in leaderboard:';
  FOR r IN (
    SELECT 
      normalized_grade,
      COUNT(*) as users,
      SUM(points) as total_points,
      MAX(points) as max_points
    FROM public.leaderboard
    WHERE normalized_grade IS NOT NULL
    GROUP BY normalized_grade
    ORDER BY 
      CASE normalized_grade
        WHEN 'preschool' THEN 1
        WHEN 'grade1' THEN 2
        WHEN 'grade2' THEN 3
        WHEN 'grade3' THEN 4
        WHEN 'grade4' THEN 5
        WHEN 'grade5' THEN 6
      END
  ) LOOP
    RAISE NOTICE '  %: % users, % total points (max: %)', 
      RPAD(r.normalized_grade, 12), 
      r.users, 
      r.total_points, 
      r.max_points;
  END LOOP;
  
  -- Check game_globals
  SELECT COUNT(*) INTO total_new_progress
  FROM public.game_globals
  WHERE total_xp > 0;
  
  RAISE NOTICE '';
  RAISE NOTICE 'game_globals: % users with XP', total_new_progress;
  
  -- Top 5 global players
  RAISE NOTICE '';
  RAISE NOTICE 'Top 5 global players:';
  FOR r IN (
    SELECT 
      l.display_name,
      g.total_xp,
      g.global_level
    FROM public.game_globals g
    JOIN public.leaderboard l ON l.user_id = g.user_id
    WHERE g.total_xp > 0
    ORDER BY g.total_xp DESC
    LIMIT 5
  ) LOOP
    RAISE NOTICE '  % - % XP (Level %)', 
      RPAD(r.display_name, 25), 
      r.total_xp, 
      r.global_level;
  END LOOP;
  
END $$;
