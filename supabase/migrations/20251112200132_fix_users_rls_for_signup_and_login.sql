/*
  # Fix RLS Policies for User Signup and Login
  
  1. Changes
    - Drop existing restrictive INSERT policy
    - Create new permissive INSERT policy that allows anon users to create their profile during signup
    - Ensure authenticated users can read and update their own profile
    - Allow service_role full access for admin operations
  
  2. Security
    - Users can only insert their own profile (auth.uid() = id)
    - Users can only read their own profile (auth.uid() = id)
    - Users can only update their own profile (auth.uid() = id)
    - Service role has full access for system operations
*/

-- Drop the existing INSERT policy that may be too restrictive
DROP POLICY IF EXISTS "Allow insert during signup" ON public.users;

-- Create a new INSERT policy that allows both anon and authenticated users to create profiles
CREATE POLICY "Allow user profile creation during signup"
ON public.users
FOR INSERT
TO anon, authenticated
WITH CHECK (auth.uid() = id);

-- Ensure SELECT policy exists for authenticated users
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;

CREATE POLICY "Users can read own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Ensure UPDATE policy exists for authenticated users
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure service_role has full access
DROP POLICY IF EXISTS "Service role full access" ON public.users;

CREATE POLICY "Service role full access"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);