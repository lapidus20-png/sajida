/*
  # Fix is_admin Function Infinite Recursion

  1. Problem
    - is_admin() function queries users table
    - users table has RLS policy that calls is_admin()
    - This creates infinite recursion during login
    
  2. Solution
    - Drop all policies that use is_admin()
    - Recreate is_admin() with SECURITY DEFINER to bypass RLS
    - Recreate all policies
*/

-- Drop all admin policies first
DROP POLICY IF EXISTS "Admins have full access to users" ON users;
DROP POLICY IF EXISTS "Admins have full access to artisans" ON artisans;
DROP POLICY IF EXISTS "Admins have full access to services" ON services;
DROP POLICY IF EXISTS "Admins have full access to avis" ON avis;
DROP POLICY IF EXISTS "Admins have full access to job requests" ON job_requests;
DROP POLICY IF EXISTS "Admins have full access to quotes" ON quotes;
DROP POLICY IF EXISTS "Admins have full access to contracts" ON contracts;
DROP POLICY IF EXISTS "Admins have full access to project timeline" ON project_timeline;
DROP POLICY IF EXISTS "Admins have full access to messages" ON messages;
DROP POLICY IF EXISTS "Admins have full access to reviews" ON reviews;

-- Drop and recreate function with SECURITY DEFINER
DROP FUNCTION IF EXISTS is_admin();

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_type text;
BEGIN
  -- Query users table directly, bypassing RLS because of SECURITY DEFINER
  SELECT user_type INTO v_user_type
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(v_user_type = 'admin', false);
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Recreate all admin policies

-- Users table
CREATE POLICY "Admins have full access to users"
  ON users FOR ALL
  TO authenticated
  USING (is_admin());

-- Artisans table
CREATE POLICY "Admins have full access to artisans"
  ON artisans FOR ALL
  TO authenticated
  USING (is_admin());

-- Services table
CREATE POLICY "Admins have full access to services"
  ON services FOR ALL
  TO authenticated
  USING (is_admin());

-- Avis table
CREATE POLICY "Admins have full access to avis"
  ON avis FOR ALL
  TO authenticated
  USING (is_admin());

-- Job requests table
CREATE POLICY "Admins have full access to job requests"
  ON job_requests FOR ALL
  TO authenticated
  USING (is_admin());

-- Quotes table
CREATE POLICY "Admins have full access to quotes"
  ON quotes FOR ALL
  TO authenticated
  USING (is_admin());

-- Contracts table
CREATE POLICY "Admins have full access to contracts"
  ON contracts FOR ALL
  TO authenticated
  USING (is_admin());

-- Project timeline table
CREATE POLICY "Admins have full access to project timeline"
  ON project_timeline FOR ALL
  TO authenticated
  USING (is_admin());

-- Messages table
CREATE POLICY "Admins have full access to messages"
  ON messages FOR ALL
  TO authenticated
  USING (is_admin());

-- Reviews table
CREATE POLICY "Admins have full access to reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (is_admin());
