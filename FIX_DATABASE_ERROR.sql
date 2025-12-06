-- =====================================================================
-- Fix Database Error: Re-enable RLS with Proper Policies
-- =====================================================================
--
-- This script fixes the "database error finding user" issue by:
-- 1. Re-enabling RLS on the users table
-- 2. Creating proper policies for authenticated users
--
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/sql
--
-- =====================================================================

-- Step 1: Re-enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing conflicting policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.users;

-- Step 3: Create policy for reading own profile
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Step 4: Create policy for inserting own profile during signup
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Step 5: Create policy for updating own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 6: Verify the policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
