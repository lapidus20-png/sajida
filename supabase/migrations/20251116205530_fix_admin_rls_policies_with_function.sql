/*
  # Fix Admin RLS Policies with Helper Function

  1. Problem
    - Admin policies check user_type on the row being queried
    - This doesn't work for checking if the current user is an admin
    
  2. Solution
    - Create a helper function to check if current user is admin
    - Use this function in all admin policies
    
  3. Tables Affected
    - All tables with admin policies
*/

-- Create helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate all admin policies using the helper function

-- Users table
DROP POLICY IF EXISTS "Admins have full access to users" ON users;
CREATE POLICY "Admins have full access to users"
  ON users FOR ALL
  TO authenticated
  USING (is_admin());

-- Artisans table
DROP POLICY IF EXISTS "Admins have full access to artisans" ON artisans;
CREATE POLICY "Admins have full access to artisans"
  ON artisans FOR ALL
  TO authenticated
  USING (is_admin());

-- Services table
DROP POLICY IF EXISTS "Admins have full access to services" ON services;
CREATE POLICY "Admins have full access to services"
  ON services FOR ALL
  TO authenticated
  USING (is_admin());

-- Avis table
DROP POLICY IF EXISTS "Admins have full access to avis" ON avis;
CREATE POLICY "Admins have full access to avis"
  ON avis FOR ALL
  TO authenticated
  USING (is_admin());

-- Job requests table
DROP POLICY IF EXISTS "Admins have full access to job requests" ON job_requests;
CREATE POLICY "Admins have full access to job requests"
  ON job_requests FOR ALL
  TO authenticated
  USING (is_admin());

-- Quotes table
DROP POLICY IF EXISTS "Admins have full access to quotes" ON quotes;
CREATE POLICY "Admins have full access to quotes"
  ON quotes FOR ALL
  TO authenticated
  USING (is_admin());

-- Contracts table
DROP POLICY IF EXISTS "Admins have full access to contracts" ON contracts;
CREATE POLICY "Admins have full access to contracts"
  ON contracts FOR ALL
  TO authenticated
  USING (is_admin());

-- Project timeline table
DROP POLICY IF EXISTS "Admins have full access to project timeline" ON project_timeline;
CREATE POLICY "Admins have full access to project timeline"
  ON project_timeline FOR ALL
  TO authenticated
  USING (is_admin());

-- Messages table
DROP POLICY IF EXISTS "Admins have full access to messages" ON messages;
CREATE POLICY "Admins have full access to messages"
  ON messages FOR ALL
  TO authenticated
  USING (is_admin());

-- Reviews table
DROP POLICY IF EXISTS "Admins have full access to reviews" ON reviews;
CREATE POLICY "Admins have full access to reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (is_admin());
