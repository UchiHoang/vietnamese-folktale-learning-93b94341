-- Migration: Update RLS policies for security
-- Date: 2026-01-21
-- Purpose: Allow public read on leaderboard, restrict profiles to owner/admin only

-- ============================================
-- LEADERBOARD POLICIES (Public Read)
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Leaderboard viewable by all" ON public.leaderboard;
DROP POLICY IF EXISTS "Users can view own leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Public can view leaderboard" ON public.leaderboard;

-- Enable RLS if not enabled
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone (including anonymous) to read leaderboard
CREATE POLICY "Public can read leaderboard"
ON public.leaderboard
FOR SELECT
USING (true);

-- Policy: Only authenticated users can update their own points
-- (This is typically done by backend/triggers, not direct client access)
CREATE POLICY "Users can update own leaderboard entry"
ON public.leaderboard
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PROFILES POLICIES (Private - Owner/Admin Only)
-- ============================================

-- Drop public read policy (if exists)
DROP POLICY IF EXISTS "Public display info viewable" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Temp public read for testing" ON public.profiles;

-- Enable RLS if not enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Policy: Users can view own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Users can insert own profile (on signup)
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- ADMIN POLICIES (Optional - for future)
-- ============================================

-- Note: Admin policies can be added later using user_roles table
-- Example:
-- CREATE POLICY "Admins can view all profiles"
-- ON public.profiles
-- FOR SELECT
-- USING (
--   EXISTS (
--     SELECT 1 FROM public.user_roles
--     WHERE user_id = auth.uid() AND role = 'admin'
--   )
-- );

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  leaderboard_policies INT;
  profiles_policies INT;
  leaderboard_rls BOOLEAN;
  profiles_rls BOOLEAN;
BEGIN
  -- Check leaderboard RLS enabled
  SELECT relrowsecurity INTO leaderboard_rls
  FROM pg_class
  WHERE relname = 'leaderboard';
  
  IF NOT leaderboard_rls THEN
    RAISE EXCEPTION 'RLS not enabled on leaderboard table';
  END IF;
  
  -- Check profiles RLS enabled
  SELECT relrowsecurity INTO profiles_rls
  FROM pg_class
  WHERE relname = 'profiles';
  
  IF NOT profiles_rls THEN
    RAISE EXCEPTION 'RLS not enabled on profiles table';
  END IF;
  
  -- Count policies on leaderboard
  SELECT COUNT(*) INTO leaderboard_policies
  FROM pg_policies
  WHERE tablename = 'leaderboard';
  
  -- Count policies on profiles
  SELECT COUNT(*) INTO profiles_policies
  FROM pg_policies
  WHERE tablename = 'profiles';
  
  RAISE NOTICE 'RLS policies updated successfully';
  RAISE NOTICE 'Leaderboard: % policies, RLS: %', leaderboard_policies, leaderboard_rls;
  RAISE NOTICE 'Profiles: % policies, RLS: %', profiles_policies, profiles_rls;
END $$;
