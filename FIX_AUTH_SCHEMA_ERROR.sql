-- ===================================================================
-- EMERGENCY FIX: Database Schema Error on Login
-- ===================================================================
-- Run this in Supabase Dashboard > SQL Editor
-- This will fix the "Database error querying schema" error
-- ===================================================================

-- STEP 1: Drop all problematic functions that might cause recursion
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.can_view_contact_info(uuid, uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.ensure_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- STEP 2: Drop all RLS policies that might cause issues during auth
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

-- STEP 3: Disable RLS on all public tables
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

-- STEP 4: Clean up any orphaned triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users;
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users;

-- STEP 5: Recreate only the essential ensure_user_profile function
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
  -- Get current user ID
  user_id := auth.uid();

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;

  -- Check if user profile exists
  SELECT * INTO existing_user
  FROM public.users
  WHERE id = user_id;

  -- Create profile if it doesn't exist
  IF NOT FOUND THEN
    INSERT INTO public.users (id, email, user_type, telephone, adresse, ville)
    VALUES (user_id, user_email, 'client', '', '', '')
    RETURNING * INTO existing_user;
  END IF;

  -- Return user data
  SELECT json_build_object(
    'success', true,
    'user_id', existing_user.id,
    'email', existing_user.email,
    'user_type', existing_user.user_type,
    'telephone', existing_user.telephone,
    'adresse', existing_user.adresse,
    'ville', existing_user.ville
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO anon;

-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================

-- Check that no policies exist (should return 0)
SELECT COUNT(*) as policy_count FROM pg_policies WHERE schemaname = 'public';

-- Check that no problematic functions exist (should return 0)
SELECT COUNT(*) as function_count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('is_admin', 'can_view_contact_info', 'create_user_profile', 'handle_new_user');

-- Check that ensure_user_profile exists (should return 1)
SELECT COUNT(*) as ensure_profile_exists
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'ensure_user_profile';

-- Check RLS status (all should be false)
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
