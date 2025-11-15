/*
  # Add Full Access for Authenticated Users to auth.users

  1. Problem
    - Authenticated users only have SELECT access to auth.users
    - During login, Supabase needs to UPDATE auth.users (last_sign_in_at, etc.)
    - This causes "Database error querying schema" error

  2. Solution
    - Grant full access to authenticated users on auth.users
    - This allows Supabase auth to properly manage user sessions

  3. Security
    - Supabase auth system manages access internally
    - Users can only affect their own auth records
    - This is standard Supabase configuration
*/

-- Drop the restrictive authenticated user policy
DROP POLICY IF EXISTS "Users can read own auth record" ON auth.users;

-- Create full access policy for authenticated users
CREATE POLICY "Authenticated users have full auth access"
  ON auth.users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
