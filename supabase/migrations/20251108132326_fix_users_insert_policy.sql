/*
  # Fix Users Table INSERT Policy

  1. Changes
    - Drop the existing INSERT policy that requires auth.uid() = id
    - Create a new INSERT policy that allows authenticated users to create their profile
    - The policy ensures users can only create a profile with their own auth.uid()
  
  2. Security
    - Users can only insert their own user record (id must match auth.uid())
    - Policy uses authenticated role instead of public for better security
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur profil" ON users;

-- Create a new INSERT policy that works during sign up
CREATE POLICY "Users can create their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
