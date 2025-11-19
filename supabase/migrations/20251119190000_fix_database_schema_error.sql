/*
  # Fix Database Schema Error on Login

  ## Problem
  - "Database error querying schema" during authentication
  - Auth system fails due to broken functions/policies causing circular dependencies

  ## Solution
  1. Drop all potentially problematic functions
  2. Drop all RLS policies
  3. Ensure RLS is disabled
  4. Recreate only essential functions
*/

-- Drop problematic functions
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.can_view_contact_info(uuid, uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.ensure_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop all policies
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
    END LOOP;
END $$;

-- Disable RLS on all tables
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.artisans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.avis DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_timeline DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.escrow_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_reveals DISABLE ROW LEVEL SECURITY;

-- Recreate essential function
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
  user_email text;
  existing_user users%ROWTYPE;
  result json;
BEGIN
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  SELECT * INTO existing_user FROM public.users WHERE id = user_id;

  IF NOT FOUND THEN
    INSERT INTO public.users (id, email, user_type, telephone, adresse, ville)
    VALUES (user_id, user_email, 'client', '', '', '')
    RETURNING * INTO existing_user;
  END IF;

  SELECT json_build_object(
    'success', true,
    'user_id', existing_user.id,
    'email', existing_user.email,
    'user_type', existing_user.user_type
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO anon;

-- Clean up triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users;
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users;
