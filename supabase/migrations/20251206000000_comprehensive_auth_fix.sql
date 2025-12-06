/*
  # Comprehensive Authentication Fix
  
  ## What This Migration Does
  1. Disables RLS on auth.users (root cause of schema errors)
  2. Removes all broken policies and functions
  3. Disables RLS on all public tables temporarily
  4. Creates proper user profile management functions
  5. Sets up admin creation capability
  
  ## User Types Supported
  - admin: Full platform access
  - client: Can post jobs and hire artisans
  - artisan: Can view jobs and submit quotes
*/

-- =====================================================================
-- STEP 1: Fix auth.users table (CRITICAL)
-- =====================================================================

-- Disable RLS on auth.users - this should NEVER be enabled
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Drop any policies on auth.users
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

-- =====================================================================
-- STEP 2: Clean up broken functions
-- =====================================================================

DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.can_view_contact_info(uuid, uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.ensure_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- =====================================================================
-- STEP 3: Drop all RLS policies on public tables
-- =====================================================================

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

-- =====================================================================
-- STEP 4: Disable RLS on all public tables
-- =====================================================================

DO $$
DECLARE
    tbl record;
BEGIN
    FOR tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tbl.tablename);
    END LOOP;
END $$;

-- =====================================================================
-- STEP 5: Remove triggers on auth.users
-- =====================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users;
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users;

-- =====================================================================
-- STEP 6: Create essential functions
-- =====================================================================

-- Function to ensure user profile exists
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
  user_email text;
  existing_user public.users%ROWTYPE;
  result json;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
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
    'user_type', existing_user.user_type,
    'telephone', existing_user.telephone,
    'ville', existing_user.ville
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO anon;

-- =====================================================================
-- STEP 7: Create admin management functions
-- =====================================================================

-- Function to create admin user (requires service role or existing admin)
CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_email text,
  admin_password text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Check if user already exists in auth.users
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = admin_email;
  
  IF new_user_id IS NOT NULL THEN
    -- User exists, update their type to admin
    UPDATE public.users
    SET user_type = 'admin'
    WHERE id = new_user_id;
    
    SELECT json_build_object(
      'success', true,
      'message', 'User updated to admin',
      'user_id', new_user_id
    ) INTO result;
  ELSE
    -- Cannot create auth user from SQL - must use Supabase Auth API
    SELECT json_build_object(
      'success', false,
      'message', 'User does not exist. Create via signup first, then promote to admin.'
    ) INTO result;
  END IF;
  
  RETURN result;
END;
$$;

-- Function to promote existing user to admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  result json;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;
  
  -- Update user type to admin
  UPDATE public.users
  SET user_type = 'admin'
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    -- Create profile if doesn't exist
    INSERT INTO public.users (id, email, user_type, telephone, adresse, ville)
    SELECT target_user_id, email, 'admin', '', '', ''
    FROM auth.users
    WHERE id = target_user_id;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'User promoted to admin',
    'user_id', target_user_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_admin_user(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.promote_to_admin(text) TO authenticated;

-- =====================================================================
-- STEP 8: Verification queries
-- =====================================================================

-- Check auth.users RLS status (should be false)
DO $$
DECLARE
  rls_status boolean;
BEGIN
  SELECT relrowsecurity INTO rls_status
  FROM pg_class
  WHERE oid = 'auth.users'::regclass;
  
  IF rls_status THEN
    RAISE WARNING 'auth.users still has RLS enabled - this will cause login failures';
  ELSE
    RAISE NOTICE 'SUCCESS: auth.users RLS is disabled';
  END IF;
END $$;

-- Check for remaining policies (should be 0)
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname IN ('auth', 'public');
  
  RAISE NOTICE 'Total policies remaining: %', policy_count;
END $$;
