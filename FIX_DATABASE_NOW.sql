-- RUN THIS IN SUPABASE SQL EDITOR
-- This will fix RLS issues on tables we control

-- 1. Remove problematic triggers (if any exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users CASCADE;
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users CASCADE;

-- 2. Disable RLS on public tables (temporary fix)
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.artisans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_requests DISABLE ROW LEVEL SECURITY;

-- 3. Drop all existing policies on public tables
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

-- 4. Drop problematic functions
DROP FUNCTION IF EXISTS public.create_user_profile CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.ensure_user_profile CASCADE;
DROP FUNCTION IF EXISTS public.is_admin CASCADE;
DROP FUNCTION IF EXISTS public.has_artisan_profile CASCADE;
