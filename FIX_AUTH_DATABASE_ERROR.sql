-- =====================================================================
-- FIX: "Database error finding user" during signup
-- =====================================================================
-- This script fixes the auth.users table issues that prevent signup
-- Run this in your Supabase SQL Editor
-- =====================================================================

-- Step 1: Disable RLS on auth.users (CRITICAL!)
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all policies on auth.users
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
        RAISE NOTICE 'Dropped policy % on auth.users', pol.policyname;
    END LOOP;
END $$;

-- Step 3: Drop all triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users;
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users;

-- Step 4: Verify the fix
DO $$
DECLARE
  rls_status boolean;
  policy_count integer;
  trigger_count integer;
BEGIN
  -- Check RLS status
  SELECT relrowsecurity INTO rls_status
  FROM pg_class
  WHERE oid = 'auth.users'::regclass;

  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'auth' AND tablename = 'users';

  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE event_object_schema = 'auth' AND event_object_table = 'users';

  -- Report results
  IF rls_status THEN
    RAISE WARNING '❌ auth.users still has RLS enabled';
  ELSE
    RAISE NOTICE '✅ auth.users RLS is disabled';
  END IF;

  IF policy_count > 0 THEN
    RAISE WARNING '❌ auth.users still has % policies', policy_count;
  ELSE
    RAISE NOTICE '✅ No policies on auth.users';
  END IF;

  IF trigger_count > 0 THEN
    RAISE WARNING '❌ auth.users still has % triggers', trigger_count;
  ELSE
    RAISE NOTICE '✅ No triggers on auth.users';
  END IF;
END $$;
