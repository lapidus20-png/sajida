/*
  Comprehensive RLS Enable and Security Policies V2
  
  Enables RLS on all tables and creates restrictive security policies.
  Uses users.user_type for admin checks, not JWT claims.
*/

-- Helper function for admin checks
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND user_type = 'admin'
  );
$$;

-- =====================================================
-- DROP ALL EXISTING POLICIES
-- =====================================================

-- artisans policies
DO $$ 
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'artisans'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON artisans';
  END LOOP;
END $$;

-- services policies
DO $$ 
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'services'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON services';
  END LOOP;
END $$;

-- avis policies
DO $$ 
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'avis'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON avis';
  END LOOP;
END $$;

-- users policies
DO $$ 
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'users'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON users';
  END LOOP;
END $$;

-- job_requests policies
DO $$ 
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'job_requests'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON job_requests';
  END LOOP;
END $$;

-- quotes policies
DO $$ 
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'quotes'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON quotes';
  END LOOP;
END $$;

-- contracts policies
DO $$ 
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'contracts'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON contracts';
  END LOOP;
END $$;

-- project_timeline policies
DO $$ 
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'project_timeline'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON project_timeline';
  END LOOP;
END $$;

-- messages policies
DO $$ 
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'messages'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON messages';
  END LOOP;
END $$;

-- reviews policies
DO $$ 
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'reviews'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON reviews';
  END LOOP;
END $$;

-- admin_logs policies
DO $$ 
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'admin_logs'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON admin_logs';
  END LOOP;
END $$;

-- payments policies
DO $$ 
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'payments'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON payments';
  END LOOP;
END $$;

-- categories policies
DO $$ 
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'categories'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON categories';
  END LOOP;
END $$;

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE avis ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ARTISANS TABLE POLICIES
-- =====================================================
CREATE POLICY "artisans_select_verified_or_own"
  ON artisans FOR SELECT TO authenticated
  USING (statut_verification = 'verifie' OR user_id = auth.uid());

CREATE POLICY "artisans_insert_own"
  ON artisans FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "artisans_update_own"
  ON artisans FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "artisans_admin_select"
  ON artisans FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "artisans_admin_insert"
  ON artisans FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "artisans_admin_update"
  ON artisans FOR UPDATE TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "artisans_admin_delete"
  ON artisans FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- =====================================================
-- SERVICES TABLE POLICIES
-- =====================================================
CREATE POLICY "services_select_own"
  ON services FOR SELECT TO authenticated
  USING (artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid()));

CREATE POLICY "services_insert_own"
  ON services FOR INSERT TO authenticated
  WITH CHECK (artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid()));

CREATE POLICY "services_update_own"
  ON services FOR UPDATE TO authenticated
  USING (artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid()))
  WITH CHECK (artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid()));

CREATE POLICY "services_admin_select"
  ON services FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "services_admin_delete"
  ON services FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- =====================================================
-- AVIS TABLE POLICIES
-- =====================================================
CREATE POLICY "avis_select_all"
  ON avis FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "avis_insert_authenticated"
  ON avis FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "avis_admin_delete"
  ON avis FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================
CREATE POLICY "users_select_own_or_admin"
  ON users FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin_user(auth.uid()));

CREATE POLICY "users_insert_own"
  ON users FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own"
  ON users FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_admin_update"
  ON users FOR UPDATE TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "users_admin_delete"
  ON users FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- =====================================================
-- JOB_REQUESTS TABLE POLICIES
-- =====================================================
CREATE POLICY "job_requests_select_published_or_own"
  ON job_requests FOR SELECT TO authenticated
  USING (statut IN ('publiee', 'en_negociation', 'attribuee', 'en_cours', 'terminee') OR client_id = auth.uid());

CREATE POLICY "job_requests_insert_own"
  ON job_requests FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "job_requests_update_own"
  ON job_requests FOR UPDATE TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "job_requests_delete_own"
  ON job_requests FOR DELETE TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "job_requests_admin_select"
  ON job_requests FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "job_requests_admin_update"
  ON job_requests FOR UPDATE TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "job_requests_admin_delete"
  ON job_requests FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- =====================================================
-- QUOTES TABLE POLICIES
-- =====================================================
CREATE POLICY "quotes_select_own_artisan"
  ON quotes FOR SELECT TO authenticated
  USING (artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid()));

CREATE POLICY "quotes_select_own_client"
  ON quotes FOR SELECT TO authenticated
  USING (job_request_id IN (SELECT id FROM job_requests WHERE client_id = auth.uid()));

CREATE POLICY "quotes_insert_artisan"
  ON quotes FOR INSERT TO authenticated
  WITH CHECK (artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid()));

CREATE POLICY "quotes_update_own_artisan"
  ON quotes FOR UPDATE TO authenticated
  USING (artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid()))
  WITH CHECK (artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid()));

CREATE POLICY "quotes_update_status_client"
  ON quotes FOR UPDATE TO authenticated
  USING (job_request_id IN (SELECT id FROM job_requests WHERE client_id = auth.uid()))
  WITH CHECK (job_request_id IN (SELECT id FROM job_requests WHERE client_id = auth.uid()));

CREATE POLICY "quotes_admin_select"
  ON quotes FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "quotes_admin_delete"
  ON quotes FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- =====================================================
-- CONTRACTS TABLE POLICIES
-- =====================================================
CREATE POLICY "contracts_select_parties"
  ON contracts FOR SELECT TO authenticated
  USING (
    client_id = auth.uid() 
    OR artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
  );

CREATE POLICY "contracts_insert_parties"
  ON contracts FOR INSERT TO authenticated
  WITH CHECK (
    client_id = auth.uid() 
    OR artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
  );

CREATE POLICY "contracts_update_parties"
  ON contracts FOR UPDATE TO authenticated
  USING (
    client_id = auth.uid() 
    OR artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
  )
  WITH CHECK (
    client_id = auth.uid() 
    OR artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
  );

CREATE POLICY "contracts_admin_select"
  ON contracts FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "contracts_admin_delete"
  ON contracts FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- =====================================================
-- PROJECT_TIMELINE TABLE POLICIES
-- =====================================================
CREATE POLICY "timeline_select_contract_parties"
  ON project_timeline FOR SELECT TO authenticated
  USING (
    contract_id IN (
      SELECT id FROM contracts 
      WHERE client_id = auth.uid() 
      OR artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "timeline_insert_contract_parties"
  ON project_timeline FOR INSERT TO authenticated
  WITH CHECK (
    contract_id IN (
      SELECT id FROM contracts 
      WHERE client_id = auth.uid() 
      OR artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "timeline_update_contract_parties"
  ON project_timeline FOR UPDATE TO authenticated
  USING (
    contract_id IN (
      SELECT id FROM contracts 
      WHERE client_id = auth.uid() 
      OR artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    contract_id IN (
      SELECT id FROM contracts 
      WHERE client_id = auth.uid() 
      OR artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "timeline_admin_select"
  ON project_timeline FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "timeline_admin_delete"
  ON project_timeline FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- =====================================================
-- MESSAGES TABLE POLICIES
-- =====================================================
CREATE POLICY "messages_select_participants"
  ON messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "messages_insert_sender"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_update_recipient"
  ON messages FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "messages_admin_select"
  ON messages FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "messages_admin_delete"
  ON messages FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- =====================================================
-- REVIEWS TABLE POLICIES
-- =====================================================
CREATE POLICY "reviews_select_verified_or_involved"
  ON reviews FOR SELECT TO authenticated
  USING (verified = true OR reviewer_id = auth.uid() OR reviewed_user_id = auth.uid());

CREATE POLICY "reviews_insert_contract_participants"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (
    contract_id IN (
      SELECT id FROM contracts 
      WHERE client_id = auth.uid() 
      OR artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
    )
    AND reviewer_id = auth.uid()
  );

CREATE POLICY "reviews_update_own_unverified"
  ON reviews FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid() AND verified = false)
  WITH CHECK (reviewer_id = auth.uid() AND verified = false);

CREATE POLICY "reviews_admin_select"
  ON reviews FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "reviews_admin_update"
  ON reviews FOR UPDATE TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "reviews_admin_delete"
  ON reviews FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- =====================================================
-- ADMIN_LOGS TABLE POLICIES
-- =====================================================
CREATE POLICY "admin_logs_select_admin_only"
  ON admin_logs FOR SELECT TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- =====================================================
-- PAYMENTS TABLE POLICIES
-- =====================================================
CREATE POLICY "payments_select_own_or_admin"
  ON payments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_user(auth.uid()));

-- =====================================================
-- CATEGORIES TABLE POLICIES
-- =====================================================
CREATE POLICY "categories_select_all"
  ON categories FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "categories_admin_insert"
  ON categories FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "categories_admin_update"
  ON categories FOR UPDATE TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "categories_admin_delete"
  ON categories FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_admin_lookup ON users(id, user_type) WHERE user_type = 'admin';
CREATE INDEX IF NOT EXISTS idx_artisans_user_id ON artisans(user_id);
CREATE INDEX IF NOT EXISTS idx_job_requests_client_id ON job_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_artisan_id ON quotes(artisan_id);
CREATE INDEX IF NOT EXISTS idx_quotes_job_request_id ON quotes(job_request_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_artisan_id ON contracts(artisan_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);
