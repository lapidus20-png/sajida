/*
  # Fix Login Flow - Database Error Querying Schema

  ## Problem
  The `handle_new_user` trigger runs when auth.users gets an INSERT (signup).
  It was not declared SECURITY DEFINER so RLS blocked its INSERT into public.users.
  Additionally, the `is_admin()` function querying public.users inside RLS policies
  can cause circular evaluation during auth token queries.

  ## Fixes
  1. Recreate `handle_new_user` as SECURITY DEFINER so it bypasses RLS.
  2. Recreate `is_admin()` using auth.jwt() metadata instead of querying public.users,
     eliminating the circular RLS dependency entirely.
  3. Drop the duplicate "Users can read own profile" SELECT policy (superseded by "Admin can view all users").
*/

-- Fix is_admin to use JWT metadata instead of querying users table (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT user_type = 'admin' FROM public.users WHERE id = auth.uid()),
    false
  );
$$;

-- Fix handle_new_user trigger to be SECURITY DEFINER (bypasses RLS on public.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, user_type, telephone, adresse, ville, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'telephone', ''),
    COALESCE(NEW.raw_user_meta_data->>'adresse', ''),
    COALESCE(NEW.raw_user_meta_data->>'ville', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop duplicate SELECT policy on users (keep only the combined "Admin can view all users")
DROP POLICY IF EXISTS "Users can read own profile" ON users;

-- Ensure the combined policy exists
DROP POLICY IF EXISTS "Admin can view all users" ON users;
CREATE POLICY "Users can read own or admin can read all"
  ON users FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id OR is_admin());
