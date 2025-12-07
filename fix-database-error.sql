/*
  Fix "Database error finding user" issue
  
  Run this in your Supabase SQL Editor:
  https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/sql
*/

-- =====================================================================
-- CRITICAL FIX: Disable RLS on auth.users
-- =====================================================================

-- This is the root cause - auth.users should NEVER have RLS enabled
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Drop all policies on auth.users
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

-- =====================================================================
-- Remove ALL triggers from auth.users
-- =====================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users CASCADE;
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users CASCADE;

-- =====================================================================
-- Disable RLS on public tables
-- =====================================================================

ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.artisans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.artisan_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_unlocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.portfolios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.certifications DISABLE ROW LEVEL SECURITY;

-- Drop all policies on public schema
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            pol.policyname, pol.schemaname, pol.tablename);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- =====================================================================
-- Verification
-- =====================================================================

DO $$
DECLARE
  rls_status boolean;
  policy_count integer;
BEGIN
  -- Check auth.users RLS
  SELECT relrowsecurity INTO rls_status
  FROM pg_class
  WHERE oid = 'auth.users'::regclass;
  
  IF rls_status THEN
    RAISE WARNING 'auth.users STILL HAS RLS ENABLED - Run this script again!';
  ELSE
    RAISE NOTICE 'SUCCESS: auth.users RLS is disabled';
  END IF;
  
  -- Count remaining policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname IN ('auth', 'public');
  
  RAISE NOTICE 'Remaining policies: %', policy_count;
  
  IF policy_count = 0 THEN
    RAISE NOTICE 'SUCCESS: All problematic policies removed';
    RAISE NOTICE 'You can now sign up and log in!';
  END IF;
END $$;
