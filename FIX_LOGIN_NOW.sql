-- =====================================================
-- FIX LOGIN ISSUE - Run this in Supabase SQL Editor
-- =====================================================
-- Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/sql/new
-- Paste this entire file and click RUN
-- =====================================================

-- Step 1: Ensure RLS is enabled on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on public.users
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "authenticated_users_select_all" ON public.users;
DROP POLICY IF EXISTS "authenticated_users_insert_own" ON public.users;
DROP POLICY IF EXISTS "authenticated_users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- Step 3: Create simple, permissive policies
CREATE POLICY "allow_authenticated_select"
ON public.users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "allow_authenticated_insert"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_authenticated_update"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 4: Verify the policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;
