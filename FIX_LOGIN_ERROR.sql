-- =====================================================================
-- FIX: Database Error Finding User
-- =====================================================================
-- Run this SQL in your Supabase SQL Editor to fix login issues
-- =====================================================================

-- STEP 1: Disable RLS on auth.users (CRITICAL - this causes login failures)
ALTER TABLE IF EXISTS auth.users DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL policies from auth.users
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'auth' AND tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON auth.users', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- STEP 3: Enable RLS on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- STEP 4: Drop old policies from public.users
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read all user types for admin check" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON public.users;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;

-- STEP 5: Create simple, working policies for public.users

-- Allow authenticated users to read ALL user records
-- (needed for app functionality and admin checks)
CREATE POLICY "authenticated_users_select_all"
ON public.users FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "authenticated_users_insert_own"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "authenticated_users_update_own"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow authenticated users to delete their own profile
CREATE POLICY "authenticated_users_delete_own"
ON public.users FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- =====================================================================
-- VERIFICATION
-- =====================================================================

-- Check RLS status
DO $$
DECLARE
  auth_rls boolean;
  users_rls boolean;
  policy_count integer;
BEGIN
  SELECT relrowsecurity INTO auth_rls
  FROM pg_class
  WHERE oid = 'auth.users'::regclass;

  SELECT relrowsecurity INTO users_rls
  FROM pg_class
  WHERE oid = 'public.users'::regclass;

  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'users';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION RESULTS:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'auth.users RLS enabled: % (should be FALSE)', auth_rls;
  RAISE NOTICE 'public.users RLS enabled: % (should be TRUE)', users_rls;
  RAISE NOTICE 'public.users policy count: %', policy_count;

  IF auth_rls THEN
    RAISE WARNING '⚠️  auth.users STILL has RLS enabled!';
  ELSE
    RAISE NOTICE '✓ auth.users RLS is correctly disabled';
  END IF;

  IF users_rls AND policy_count = 4 THEN
    RAISE NOTICE '✓ public.users configuration is correct';
  END IF;

  RAISE NOTICE '========================================';
END $$;

-- Show current policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY cmd, policyname;
