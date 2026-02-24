-- Migration: Denormalize leaderboard table for security and performance
-- Date: 2026-01-21
-- Purpose: Add public display columns to leaderboard to avoid exposing sensitive profiles data

-- ============================================
-- STEP 1: Add new columns to leaderboard
-- ============================================

ALTER TABLE public.leaderboard
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS grade TEXT,
ADD COLUMN IF NOT EXISTS school TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT;

-- ============================================
-- STEP 2: Handle orphan leaderboard entries
-- ============================================
-- Create profiles for users in leaderboard who don't have profiles yet
-- Found: 1 orphan entry in current database

INSERT INTO public.profiles (id, display_name, grade, avatar, school)
SELECT 
  l.user_id,
  'Người chơi ' || SUBSTRING(l.user_id::text FROM 1 FOR 8),
  'grade1',
  '👤',
  'Chưa cập nhật'
FROM public.leaderboard l
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = l.user_id)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 3: Set default grade for existing profiles
-- ============================================
-- Fix: 14/15 profiles have NULL or empty grade
-- This ensures data consistency for leaderboard filtering

UPDATE public.profiles
SET grade = 'grade1'
WHERE grade IS NULL OR grade = '';

-- ============================================
-- STEP 4: Populate leaderboard from profiles
-- ============================================
-- Copy display data from profiles to leaderboard

UPDATE public.leaderboard l
SET 
  display_name = COALESCE(p.display_name, 'Người chơi ẩn danh'),
  grade = COALESCE(p.grade, 'grade1'),
  school = p.school,
  avatar = COALESCE(p.avatar, '👤')
FROM public.profiles p
WHERE l.user_id = p.id;

-- ============================================
-- STEP 5: Add constraints
-- ============================================
-- Ensure display_name is never NULL

ALTER TABLE public.leaderboard
ALTER COLUMN display_name SET DEFAULT 'Người chơi ẩn danh';

-- Make display_name NOT NULL (after population)
UPDATE public.leaderboard
SET display_name = 'Người chơi ẩn danh'
WHERE display_name IS NULL;

ALTER TABLE public.leaderboard
ALTER COLUMN display_name SET NOT NULL;

-- ============================================
-- STEP 6: Create indexes for performance
-- ============================================
-- Index for filtering by grade

CREATE INDEX IF NOT EXISTS idx_leaderboard_grade 
ON public.leaderboard(grade);

-- Composite index for leaderboard queries (points DESC + grade)
CREATE INDEX IF NOT EXISTS idx_leaderboard_points_grade 
ON public.leaderboard(points DESC, grade);

-- Index for foreign key (if not exists)
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id 
ON public.leaderboard(user_id);

-- ============================================
-- VERIFICATION
-- ============================================
-- Verify migration success

DO $$
DECLARE
  col_count INT;
  data_count INT;
  null_count INT;
BEGIN
  -- Check columns added
  SELECT COUNT(*)
  INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'leaderboard'
    AND column_name IN ('display_name', 'grade', 'school', 'avatar');
  
  IF col_count != 4 THEN
    RAISE EXCEPTION 'Migration failed: Not all columns were added (found %, expected 4)', col_count;
  END IF;
  
  -- Check data populated
  SELECT COUNT(*)
  INTO data_count
  FROM public.leaderboard
  WHERE display_name IS NOT NULL;
  
  IF data_count = 0 THEN
    RAISE EXCEPTION 'Migration failed: No data was populated';
  END IF;
  
  -- Check no NULL display_names
  SELECT COUNT(*)
  INTO null_count
  FROM public.leaderboard
  WHERE display_name IS NULL;
  
  IF null_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: Found % NULL display_names', null_count;
  END IF;
  
  RAISE NOTICE 'Migration successful: % columns added, % records populated', col_count, data_count;
END $$;
