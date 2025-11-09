/*
  # Fix RLS Policy for Users Table

  1. Problem
    - Current INSERT policy requires authenticated role, but during signup the user isn't fully authenticated yet
    - This prevents new users from being created in the users table after auth.signUp()

  2. Solution
    - Drop the restrictive INSERT policy
    - Create a new INSERT policy that allows any authenticated user to insert their own profile
    - Use anon role for the initial insert to allow signup flow
    - Maintain security by checking auth.uid() = id

  3. Security
    - Users can only create their own profile (auth.uid() = id check)
    - No user can create a profile for another user
    - All other operations (SELECT, UPDATE) remain restricted to the user's own data
*/

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur profil" ON users;

-- Create new INSERT policy that works during signup
-- Allow both authenticated and anon roles to insert, but only their own profile
CREATE POLICY "Les utilisateurs peuvent créer leur profil"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);