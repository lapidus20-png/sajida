/*
  # Fix users table INSERT policy for signup
  
  1. Changes
    - Drop existing restrictive INSERT policy
    - Create new policy allowing authenticated users to insert their own profile during signup
    - The trigger automatically creates the user record, but if manual insertion is needed, this allows it
  
  2. Security
    - Policy ensures users can only insert records matching their auth.uid()
    - Maintains RLS protection while allowing signup flow to work
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create a new INSERT policy that works with the signup flow
CREATE POLICY "Users can insert own profile during signup"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Verify RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;