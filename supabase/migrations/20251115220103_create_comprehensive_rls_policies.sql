/*
  # Create Comprehensive RLS Policies for All Tables

  1. Security Approach
    - Users can read public artisan/service data
    - Users can only modify their own data
    - Artisans can manage their own profiles and services
    - Clients can manage their own job requests and contracts
    - Admin users have full access to all data

  2. Tables Covered
    - users (profile management)
    - artisans (artisan profiles)
    - services (service requests)
    - avis (reviews)
    - job_requests (job postings)
    - quotes (price quotes)
    - contracts (signed contracts)
    - project_timeline (project milestones)
    - messages (private messaging)
    - reviews (verified reviews)
    - admin_logs (admin audit trail)

  3. Policy Types
    - SELECT: Read access
    - INSERT: Create new records
    - UPDATE: Modify existing records
    - DELETE: Remove records
*/

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins have full access to users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- =============================================
-- ARTISANS TABLE POLICIES
-- =============================================

CREATE POLICY "Anyone can view verified artisans"
  ON artisans FOR SELECT
  TO authenticated, anon
  USING (statut_verification = 'verifie');

CREATE POLICY "Artisans can view own profile"
  ON artisans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Artisans can create own profile"
  ON artisans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Artisans can update own profile"
  ON artisans FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins have full access to artisans"
  ON artisans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- =============================================
-- SERVICES TABLE POLICIES
-- =============================================

CREATE POLICY "Anyone can view services"
  ON services FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Artisans can update their services"
  ON services FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = services.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins have full access to services"
  ON services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- =============================================
-- AVIS (REVIEWS) TABLE POLICIES
-- =============================================

CREATE POLICY "Anyone can read reviews"
  ON avis FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON avis FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own reviews"
  ON avis FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = avis.service_id
      AND services.client_nom = (SELECT email FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admins have full access to avis"
  ON avis FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- =============================================
-- JOB REQUESTS TABLE POLICIES
-- =============================================

CREATE POLICY "Authenticated users can view job requests"
  ON job_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can create job requests"
  ON job_requests FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own job requests"
  ON job_requests FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can delete own job requests"
  ON job_requests FOR DELETE
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Admins have full access to job requests"
  ON job_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- =============================================
-- QUOTES TABLE POLICIES
-- =============================================

CREATE POLICY "Clients and artisans can view relevant quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (
    artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
    OR
    job_request_id IN (SELECT id FROM job_requests WHERE client_id = auth.uid())
  );

CREATE POLICY "Artisans can create quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (
    artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
  );

CREATE POLICY "Artisans can update own quotes"
  ON quotes FOR UPDATE
  TO authenticated
  USING (
    artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
  )
  WITH CHECK (
    artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
  );

CREATE POLICY "Clients can update quote status"
  ON quotes FOR UPDATE
  TO authenticated
  USING (
    job_request_id IN (SELECT id FROM job_requests WHERE client_id = auth.uid())
  )
  WITH CHECK (
    job_request_id IN (SELECT id FROM job_requests WHERE client_id = auth.uid())
  );

CREATE POLICY "Admins have full access to quotes"
  ON quotes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- =============================================
-- CONTRACTS TABLE POLICIES
-- =============================================

CREATE POLICY "Parties can view their contracts"
  ON contracts FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid()
    OR
    artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
  );

CREATE POLICY "System can create contracts"
  ON contracts FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid()
    OR
    artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
  );

CREATE POLICY "Parties can update their contracts"
  ON contracts FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid()
    OR
    artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
  )
  WITH CHECK (
    client_id = auth.uid()
    OR
    artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins have full access to contracts"
  ON contracts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- =============================================
-- PROJECT TIMELINE TABLE POLICIES
-- =============================================

CREATE POLICY "Parties can view project timeline"
  ON project_timeline FOR SELECT
  TO authenticated
  USING (
    contract_id IN (
      SELECT id FROM contracts
      WHERE client_id = auth.uid()
      OR artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Artisans can manage project timeline"
  ON project_timeline FOR ALL
  TO authenticated
  USING (
    contract_id IN (
      SELECT id FROM contracts
      WHERE artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Admins have full access to project timeline"
  ON project_timeline FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- =============================================
-- MESSAGES TABLE POLICIES
-- =============================================

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can mark messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Admins have full access to messages"
  ON messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- =============================================
-- REVIEWS TABLE POLICIES
-- =============================================

CREATE POLICY "Anyone can read verified reviews"
  ON reviews FOR SELECT
  TO authenticated, anon
  USING (verified = true);

CREATE POLICY "Users can view own reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (
    reviewer_id = auth.uid() OR reviewed_user_id = auth.uid()
  );

CREATE POLICY "Contract parties can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid()
    AND
    contract_id IN (
      SELECT id FROM contracts
      WHERE client_id = auth.uid()
      OR artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Admins have full access to reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- =============================================
-- ADMIN LOGS TABLE POLICIES
-- =============================================

CREATE POLICY "Only admins can view admin logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can create admin logs"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    admin_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );
