/*
  # Add INSERT policy for users table

  This migration adds a Row Level Security policy that allows authenticated users
  to insert their own profile into the users table during registration.

  1. Changes
    - Adds INSERT policy for users table
    - Allows users to create their own profile where id matches auth.uid()
*/

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
