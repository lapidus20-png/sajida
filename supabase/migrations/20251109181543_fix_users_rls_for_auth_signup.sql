/*
  # Fix RLS policies on users table for auth signup
  
  1. Changes
    - Re-enable RLS on public.users
    - Add policy to allow anon users to insert during signup
    - Keep existing authenticated user policies
    
  2. Security
    - Anon users can only insert their own profile (checked via auth.uid())
    - Authenticated users can read/update their own data
    - Service role can manage all users
*/

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop the restrictive insert policy for authenticated users
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON public.users;

-- Allow authenticated AND anon users to insert during signup
-- This is needed because during signup, the user is not yet fully authenticated
CREATE POLICY "Allow user creation during signup"
  ON public.users
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (auth.uid() = id);

-- Keep existing policies for select and update
-- These should already exist and only work for authenticated users