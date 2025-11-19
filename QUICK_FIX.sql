-- ===================================================================
-- QUICK FIX: Disable RLS on auth.users table
-- ===================================================================
-- Run this in Supabase Dashboard > SQL Editor > New Query
-- Click "Run" button or press Ctrl+Enter
-- ===================================================================

-- Step 1: Disable RLS on auth.users (the root cause)
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop any policies on auth.users
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
    END LOOP;
END $$;

-- Step 3: Verify the fix
SELECT
    'auth.users RLS Status' as check_name,
    CASE
        WHEN relrowsecurity = false THEN '✓ FIXED - RLS is disabled'
        ELSE '✗ STILL BROKEN - RLS is enabled'
    END as status
FROM pg_class
WHERE oid = 'auth.users'::regclass;
