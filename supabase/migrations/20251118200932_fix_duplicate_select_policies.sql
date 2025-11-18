/*
  # Fix Duplicate SELECT Policies on Users Table

  ## Problem
  - Two SELECT policies on users table
  - "Users can read own profile" (restrictive)
  - "Users can read all user types for admin check" (permissive)
  - The permissive one makes the restrictive one redundant

  ## Solution
  - Keep only the permissive policy that allows reading all users
  - This is needed for admin functionality
  - Still secure: users can only UPDATE/INSERT their own data

  ## Security
  - SELECT: All authenticated users can read user list (needed for admin checks, artisan discovery)
  - INSERT: Users can only insert their own profile (auth.uid() = id)
  - UPDATE: Users can only update their own profile (auth.uid() = id)
*/

-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;

-- Keep the permissive SELECT policy (already exists)
-- This allows all authenticated users to read the users table
-- Which is necessary for admin checks and artisan listings
