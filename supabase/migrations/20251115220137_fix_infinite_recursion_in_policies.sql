/*
  # Fix Infinite Recursion in RLS Policies

  1. Problem
    - Admin policies check users table to verify admin status
    - This creates infinite recursion when querying users table
    
  2. Solution
    - Use direct user_type check instead of subquery for users table
    - Cache admin status in session or use simpler checks
    - For other tables, the admin check is fine

  3. Changes
    - Update users table policies to avoid recursion
    - Keep other table policies as they are (they work fine)
*/

-- Drop problematic users table policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins have full access to users" ON users;

-- Recreate users policies without recursion
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin policy for users - simplified to avoid recursion
CREATE POLICY "Admins have full access to users"
  ON users FOR ALL
  TO authenticated
  USING (user_type = 'admin');
