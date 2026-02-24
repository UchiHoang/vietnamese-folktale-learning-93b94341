-- Migration: Add normalized_grade and sync points from game_progress
-- Date: 2026-01-21
-- Purpose: Fix leaderboard to show correct points and support all grade filters

-- ============================================
-- STEP 1: Add normalized_grade column
-- ============================================

ALTER TABLE public.leaderboard
ADD COLUMN IF NOT EXISTS normalized_grade TEXT;

-- ============================================
-- STEP 2: Sync points from game_progress
-- ============================================
-- Aggregate total points per user from all their games

UPDATE public.leaderboard l
SET points = (
  SELECT COALESCE(SUM(gp.total_points), 0)
  FROM public.game_progress gp
  WHERE gp.user_id = l.user_id
);

-- ============================================
-- STEP 3: Populate normalized_grade
-- ============================================
-- Extract normalized grade from game_progress
-- If user plays multiple grades, use the one with highest points

UPDATE public.leaderboard l
SET normalized_grade = (
  SELECT CASE
    WHEN gp.grade LIKE '%preschool%' OR gp.grade LIKE '%mam-non%' THEN 'preschool'
    WHEN gp.grade LIKE '%grade1%' OR gp.grade = '1' THEN 'grade1'
    WHEN gp.grade LIKE '%grade2%' OR gp.grade = '2' THEN 'grade2'
    WHEN gp.grade LIKE '%grade3%' OR gp.grade = '3' THEN 'grade3'
    WHEN gp.grade LIKE '%grade4%' OR gp.grade = '4' THEN 'grade4'
    WHEN gp.grade LIKE '%grade5%' OR gp.grade = '5' THEN 'grade5'
    ELSE 'grade1'
  END
  FROM public.game_progress gp
  WHERE gp.user_id = l.user_id
  ORDER BY gp.total_points DESC
  LIMIT 1
);

-- ============================================
-- STEP 4: Handle users without game_progress
-- ============================================
-- Default to their profile grade or 'grade1'

UPDATE public.leaderboard l
SET normalized_grade = COALESCE(
  l.normalized_grade,
  l.grade,
  'grade1'
)
WHERE normalized_grade IS NULL;

-- ============================================
-- STEP 5: Create index for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_leaderboard_normalized_grade 
ON public.leaderboard(normalized_grade);

-- Composite index for common queries (points DESC + normalized_grade)
CREATE INDEX IF NOT EXISTS idx_leaderboard_points_normalized_grade 
ON public.leaderboard(points DESC, normalized_grade);

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  total_points_leaderboard BIGINT;
  total_points_game_progress BIGINT;
  users_with_normalized_grade INT;
  total_users INT;
  r RECORD;
BEGIN
  -- Check points synced correctly
  SELECT SUM(points) INTO total_points_leaderboard FROM public.leaderboard;
  SELECT SUM(total_points) INTO total_points_game_progress FROM public.game_progress;
  
  -- Check normalized_grade populated
  SELECT COUNT(*) INTO total_users FROM public.leaderboard;
  SELECT COUNT(*) INTO users_with_normalized_grade 
  FROM public.leaderboard 
  WHERE normalized_grade IS NOT NULL;
  
  RAISE NOTICE '=== MIGRATION VERIFICATION ===';
  RAISE NOTICE 'Points synced: Leaderboard=%, Game Progress=%', 
    total_points_leaderboard, total_points_game_progress;
  RAISE NOTICE 'Normalized grade: %/% users', 
    users_with_normalized_grade, total_users;
  
  -- Grade distribution
  FOR r IN (
    SELECT normalized_grade, COUNT(*) as cnt, SUM(points) as total
    FROM public.leaderboard
    GROUP BY normalized_grade
    ORDER BY normalized_grade
  ) LOOP
    RAISE NOTICE 'Grade %: % users, % points', r.normalized_grade, r.cnt, r.total;
  END LOOP;
  
  -- Warnings
  IF users_with_normalized_grade < total_users THEN
    RAISE WARNING '% users missing normalized_grade!', (total_users - users_with_normalized_grade);
  END IF;
  
END $$;
