/*
  # Re-enable RLS with Proper Security Policies

  ## Overview
  This migration re-enables Row Level Security (RLS) that was previously disabled and implements
  proper security policies for all tables.

  ## Security Changes
  
  ### 1. Re-enable RLS on all tables
  - users
  - artisans
  - job_requests
  - quotes
  - contracts
  - messages
  - reviews
  - admin_logs
  - payments
  - client_documents
  - saved_jobs
  - notifications
  - wallet_balances
  - wallet_transactions
  - app_settings
  - job_artisan_selections
  
  ### 2. Implement Secure Policies
  Each table will have policies that:
  - Allow users to read their own data
  - Restrict updates to own data only
  - Prevent unauthorized access
  - Allow admins full access where appropriate
  
  ## Important Notes
  - All policies use auth.uid() for authentication checks
  - Policies are restrictive by default (deny all unless explicitly allowed)
  - Separate policies for SELECT, INSERT, UPDATE, DELETE operations
*/

-- Re-enable RLS on all tables (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_artisan_selections ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Allow service role full access to users"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Artisans table policies
CREATE POLICY "Anyone can view verified artisans"
  ON artisans FOR SELECT
  TO authenticated
  USING (statut_verification = 'verifie');

CREATE POLICY "Artisans can view own profile"
  ON artisans FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

CREATE POLICY "Artisans can update own profile"
  ON artisans FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow service role full access to artisans"
  ON artisans FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Job Requests table policies
CREATE POLICY "Authenticated users can view published jobs"
  ON job_requests FOR SELECT
  TO authenticated
  USING (statut = 'publiee');

CREATE POLICY "Clients can view own job requests"
  ON job_requests FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Clients can insert own job requests"
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

-- Quotes table policies
CREATE POLICY "Artisans can view own quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view quotes for their jobs"
  ON quotes FOR SELECT
  TO authenticated
  USING (
    job_request_id IN (
      SELECT id FROM job_requests WHERE client_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can insert quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can update own quotes"
  ON quotes FOR UPDATE
  TO authenticated
  USING (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

-- Contracts table policies
CREATE POLICY "Clients can view own contracts"
  ON contracts FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Artisans can view own contracts"
  ON contracts FOR SELECT
  TO authenticated
  USING (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

-- Messages table policies
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Reviews table policies
CREATE POLICY "Anyone can view verified reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (verified = true);

CREATE POLICY "Users can view reviews about them"
  ON reviews FOR SELECT
  TO authenticated
  USING (reviewed_user_id = auth.uid());

CREATE POLICY "Users can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id = auth.uid());

-- Client Documents table policies
CREATE POLICY "Users can view own documents"
  ON client_documents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own documents"
  ON client_documents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own documents"
  ON client_documents FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Saved Jobs table policies
CREATE POLICY "Artisans can view own saved jobs"
  ON saved_jobs FOR SELECT
  TO authenticated
  USING (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can insert saved jobs"
  ON saved_jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can delete own saved jobs"
  ON saved_jobs FOR DELETE
  TO authenticated
  USING (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

-- Notifications table policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Wallet Balances table policies
CREATE POLICY "Artisans can view own wallet balance"
  ON wallet_balances FOR SELECT
  TO authenticated
  USING (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

-- Wallet Transactions table policies
CREATE POLICY "Artisans can view own transactions"
  ON wallet_transactions FOR SELECT
  TO authenticated
  USING (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

-- App Settings table policies (read-only for most users)
CREATE POLICY "Anyone can read app settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update app settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Job Artisan Selections table policies
CREATE POLICY "Clients can view selections for their jobs"
  ON job_artisan_selections FOR SELECT
  TO authenticated
  USING (
    job_request_id IN (
      SELECT id FROM job_requests WHERE client_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can view selections they're part of"
  ON job_artisan_selections FOR SELECT
  TO authenticated
  USING (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can insert selections"
  ON job_artisan_selections FOR INSERT
  TO authenticated
  WITH CHECK (
    job_request_id IN (
      SELECT id FROM job_requests WHERE client_id = auth.uid()
    )
  );

-- Payments table policies (restrictive - only admins)
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Admin Logs table policies (restrictive - only admins)
CREATE POLICY "Admins can view admin logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can insert admin logs"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );
