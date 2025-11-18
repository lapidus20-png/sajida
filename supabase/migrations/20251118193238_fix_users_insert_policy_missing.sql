/*
  # Fix Users Table INSERT Policy

  ## Problem
  - Users table has SELECT and UPDATE policies
  - Missing INSERT policy for new user registration
  - New users cannot create their profile during signup

  ## Solution
  - Add INSERT policy allowing users to create their own profile
  - Policy checks that the user ID matches auth.uid()
  - This allows the create_user_profile RPC function to work

  ## Security
  - Users can only insert a record with their own ID
  - Prevents users from creating profiles for other users
  - Admin access maintained through existing "Admins have full access" policy
*/

-- Drop existing policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Add INSERT policy for users to create their own profile
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
