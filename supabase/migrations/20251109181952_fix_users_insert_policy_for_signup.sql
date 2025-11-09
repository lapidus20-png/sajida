/*
  # Fix users RLS for signup - allow service role access
  
  1. Changes
    - Drop restrictive anon insert policy
    - Add service_role SELECT policy (Supabase Auth needs this)
    - Simplify insert policy to allow service role
    
  2. Security
    - Service role (Supabase Auth) can read/write users table
    - Authenticated users can only see their own data
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow user creation during signup" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

-- Allow service role to SELECT (needed for auth to check existing users)
CREATE POLICY "Service role can read all users"
  ON public.users
  FOR SELECT
  TO service_role
  USING (true);

-- Allow service role to INSERT (for user creation)
CREATE POLICY "Service role can insert users"
  ON public.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);