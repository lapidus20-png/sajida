-- RUN THIS IN SUPABASE SQL EDITOR
-- This will fix all RLS issues and allow signup to work

-- 1. Disable RLS on auth.users
ALTER TABLE IF EXISTS auth.users DISABLE ROW LEVEL SECURITY;

-- 2. Drop all policies on auth.users
DO $$
DECLARE pol record;
BEGIN
    FOR pol IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'auth' AND tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON auth.users', pol.policyname);
    END LOOP;
END $$;

-- 3. Remove problematic triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users CASCADE;
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users CASCADE;

-- 4. Disable RLS on public tables
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.artisans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_requests DISABLE ROW LEVEL SECURITY;

-- 5. Drop all policies on public tables
DO $$
DECLARE
  pol record;
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['users', 'artisans', 'jobs', 'quotes', 'reviews', 'messages', 'notifications', 'payments', 'contact_requests'])
  LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;
  END LOOP;
END $$;

-- 6. Drop problematic functions
DROP FUNCTION IF EXISTS create_user_profile CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS ensure_user_profile CASCADE;
DROP FUNCTION IF EXISTS is_admin CASCADE;
DROP FUNCTION IF EXISTS has_artisan_profile CASCADE;
