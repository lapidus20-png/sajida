-- =====================================================
-- COMPLETE AUTHENTICATION FIX
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Drop all problematic triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users CASCADE;
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users CASCADE;

-- Step 2: Drop all problematic functions
DROP FUNCTION IF EXISTS public.create_user_profile CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.ensure_user_profile CASCADE;
DROP FUNCTION IF EXISTS public.is_admin CASCADE;
DROP FUNCTION IF EXISTS public.has_artisan_profile CASCADE;

-- Step 3: Disable RLS on all public tables
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.artisans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_requests DISABLE ROW LEVEL SECURITY;

-- Step 4: Drop ALL existing policies on public tables
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

-- Step 5: Make telephone nullable in users table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'telephone'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.users ALTER COLUMN telephone DROP NOT NULL;
  END IF;
END $$;

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);

-- Step 7: Create admin user (IMPORTANT: First create admin@builderhub.com in Supabase Auth)
-- Go to Authentication > Users > Add User
-- Email: admin@builderhub.com
-- Password: your_secure_password
-- Then run this to add them to public.users:

-- This will work after you create the admin in Supabase Auth
INSERT INTO public.users (id, email, user_type, telephone, adresse, ville)
SELECT
  id,
  email,
  'admin',
  NULL,
  NULL,
  NULL
FROM auth.users
WHERE email = 'admin@builderhub.com'
ON CONFLICT (id) DO UPDATE SET user_type = 'admin';

-- =====================================================
-- VERIFICATION QUERIES (run these to check if it worked)
-- =====================================================

-- Check if RLS is disabled (should show 'f' for false)
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'artisans');

-- Check if policies exist (should return 0 rows)
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'artisans');

-- Check if telephone is nullable (should show YES)
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
AND column_name = 'telephone';
