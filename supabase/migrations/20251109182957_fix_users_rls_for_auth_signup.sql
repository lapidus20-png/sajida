/*
  # Fix users table RLS for Supabase Auth signup
  
  1. Changes
    - Enable RLS on public.users
    - Grant full access to service_role (Supabase Auth backend)
    - Allow authenticated users to manage their own profile
    
  2. Security
    - RLS is enabled
    - Service role (Supabase Auth) bypasses RLS automatically
    - Authenticated users can only access their own data
*/

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Service role can read all users" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON public.users;

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- NOTE: service_role automatically bypasses RLS
-- No need for explicit service_role policies