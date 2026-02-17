/*
  # Fix Infinite Recursion in Users RLS Policies

  ## Problem
  The "Admins can view all users" policy creates infinite recursion by querying 
  the users table within a policy that's checking access to the users table.

  ## Solution
  1. Drop the problematic admin policy
  2. Create a SECURITY DEFINER function that bypasses RLS to check admin status
  3. Create a new admin policy using the safe function

  ## Changes
  - Drop policy: "Admins can view all users"
  - Create function: is_admin() with SECURITY DEFINER
  - Create new policy: "Admin users can view all users" using the safe function

  ## Security
  - Function is marked SECURITY DEFINER to bypass RLS safely
  - Function only checks admin status, nothing more
  - Policies remain restrictive for non-admin users
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Create a SECURITY DEFINER function to safely check admin status
-- This function bypasses RLS, preventing infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
    AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a new admin policy using the safe function
CREATE POLICY "Admin users can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Also allow admins to update other users
CREATE POLICY "Admin users can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Allow admins to delete users
CREATE POLICY "Admin users can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (public.is_admin());