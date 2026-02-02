/*
  # Fix FOR ALL policies - Replace with separate SELECT, INSERT, UPDATE, DELETE policies

  1. Changes
    - Drop all existing "FOR ALL" admin policies
    - Create separate SELECT, INSERT, UPDATE, DELETE policies for admin access
    - Applies to: users, artisans, services, avis, job_requests, quotes, contracts, project_timeline, messages, reviews
  
  2. Security
    - Better granularity and security control
    - Easier to audit and debug
    - Follows PostgreSQL best practices
*/

-- Drop existing "FOR ALL" policies if they exist
DROP POLICY IF EXISTS "Admin full access" ON users;
DROP POLICY IF EXISTS "Admin full access" ON artisans;
DROP POLICY IF EXISTS "Admin full access" ON services;
DROP POLICY IF EXISTS "Admin full access" ON avis;
DROP POLICY IF EXISTS "Admin full access" ON job_requests;
DROP POLICY IF EXISTS "Admin full access" ON quotes;
DROP POLICY IF EXISTS "Admin full access" ON contracts;
DROP POLICY IF EXISTS "Admin full access" ON project_timeline;
DROP POLICY IF EXISTS "Admin full access" ON messages;
DROP POLICY IF EXISTS "Admin full access" ON reviews;

-- Users table - Admin policies
CREATE POLICY "Admin can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Artisans table - Admin policies
CREATE POLICY "Admin can view all artisans"
  ON artisans
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can insert artisans"
  ON artisans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update artisans"
  ON artisans
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete artisans"
  ON artisans
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Services table - Admin policies
CREATE POLICY "Admin can view all services"
  ON services
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can insert services"
  ON services
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update services"
  ON services
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete services"
  ON services
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Avis table - Admin policies
CREATE POLICY "Admin can view all avis"
  ON avis
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can insert avis"
  ON avis
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update avis"
  ON avis
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete avis"
  ON avis
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Job requests table - Admin policies
CREATE POLICY "Admin can view all job requests"
  ON job_requests
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can insert job requests"
  ON job_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update job requests"
  ON job_requests
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete job requests"
  ON job_requests
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Quotes table - Admin policies
CREATE POLICY "Admin can view all quotes"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can insert quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete quotes"
  ON quotes
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Contracts table - Admin policies
CREATE POLICY "Admin can view all contracts"
  ON contracts
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can insert contracts"
  ON contracts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update contracts"
  ON contracts
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete contracts"
  ON contracts
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Project timeline table - Admin policies
CREATE POLICY "Admin can view all project timeline"
  ON project_timeline
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can insert project timeline"
  ON project_timeline
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update project timeline"
  ON project_timeline
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete project timeline"
  ON project_timeline
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Messages table - Admin policies
CREATE POLICY "Admin can view all messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can insert messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Reviews table - Admin policies
CREATE POLICY "Admin can view all reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can insert reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can delete reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');