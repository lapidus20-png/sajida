/*
  # Fix Infinite Recursion in Users RLS

  ## Problem
  is_admin() queries public.users inside a SELECT policy on public.users — infinite recursion.

  ## Fix
  Store admin status in auth.users metadata (raw_app_meta_data) and read it from JWT,
  which does NOT trigger RLS on public.users.
  
  Also update the existing admin user's app_metadata so the JWT check works.
*/

-- is_admin reads from JWT app_metadata — zero recursion, zero extra queries
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'user_type') = 'admin',
    false
  );
$$;

-- Sync app_metadata for the existing admin user so JWT carries user_type=admin
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"user_type":"admin"}'::jsonb
WHERE email = 'admin@builderhub.com';
