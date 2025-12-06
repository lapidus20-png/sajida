/*
  # Fix Signup RLS Policies

  ## What This Does
  1. Enables RLS on critical tables
  2. Creates policies to allow signup (insert own profile)
  3. Creates policies to allow users to read/update their own data
  4. Ensures artisans can create their profiles

  ## Security Model
  - Users can only insert/update their own profiles
  - Authenticated users can read artisan listings
  - Admins have full access (checked by user_type)

  ## How to Apply
  1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx
  2. Navigate to SQL Editor
  3. Create a new query
  4. Paste this entire SQL script
  5. Click "Run" to execute
*/

-- =====================================================================
-- STEP 1: Enable RLS on key tables
-- =====================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demandes_travail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avis ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- STEP 2: Create policies for USERS table
-- =====================================================================

-- Allow authenticated users to insert their own profile during signup
CREATE POLICY "Users can insert own profile during signup"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to read all users
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.user_type = 'admin'
    )
  );

-- =====================================================================
-- STEP 3: Create policies for ARTISANS table
-- =====================================================================

-- Allow authenticated users to insert their own artisan profile during signup
CREATE POLICY "Artisans can insert own profile during signup"
  ON public.artisans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow everyone to read artisan profiles (public directory)
CREATE POLICY "Anyone can read artisan profiles"
  ON public.artisans FOR SELECT
  TO authenticated
  USING (true);

-- Allow artisans to update their own profile
CREATE POLICY "Artisans can update own profile"
  ON public.artisans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage all artisans
CREATE POLICY "Admins can manage all artisans"
  ON public.artisans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.user_type = 'admin'
    )
  );

-- =====================================================================
-- STEP 4: Create policies for DEMANDES_TRAVAIL table
-- =====================================================================

-- Clients can create job requests
CREATE POLICY "Clients can create job requests"
  ON public.demandes_travail FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.user_type = 'client'
    )
  );

-- Clients can read their own job requests
CREATE POLICY "Clients can read own job requests"
  ON public.demandes_travail FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

-- Artisans can read all job requests
CREATE POLICY "Artisans can read all job requests"
  ON public.demandes_travail FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.user_type = 'artisan'
    )
  );

-- Clients can update their own job requests
CREATE POLICY "Clients can update own job requests"
  ON public.demandes_travail FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- Admins can manage all job requests
CREATE POLICY "Admins can manage all job requests"
  ON public.demandes_travail FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.user_type = 'admin'
    )
  );

-- =====================================================================
-- STEP 5: Create policies for DEVIS table
-- =====================================================================

-- Artisans can create quotes for job requests
CREATE POLICY "Artisans can create quotes"
  ON public.devis FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = artisan_id AND
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.user_type = 'artisan'
    )
  );

-- Artisans can read their own quotes
CREATE POLICY "Artisans can read own quotes"
  ON public.devis FOR SELECT
  TO authenticated
  USING (auth.uid() = artisan_id);

-- Clients can read quotes for their job requests
CREATE POLICY "Clients can read quotes for their jobs"
  ON public.devis FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.demandes_travail dt
      WHERE dt.id = devis.demande_id
      AND dt.client_id = auth.uid()
    )
  );

-- Artisans can update their own quotes
CREATE POLICY "Artisans can update own quotes"
  ON public.devis FOR UPDATE
  TO authenticated
  USING (auth.uid() = artisan_id)
  WITH CHECK (auth.uid() = artisan_id);

-- =====================================================================
-- STEP 6: Create policies for MESSAGES table
-- =====================================================================

-- Users can send messages
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = expediteur_id);

-- Users can read messages they sent
CREATE POLICY "Users can read messages they sent"
  ON public.messages FOR SELECT
  TO authenticated
  USING (auth.uid() = expediteur_id);

-- Users can read messages sent to them
CREATE POLICY "Users can read messages sent to them"
  ON public.messages FOR SELECT
  TO authenticated
  USING (auth.uid() = destinataire_id);

-- Users can update messages they sent
CREATE POLICY "Users can update messages they sent"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = expediteur_id)
  WITH CHECK (auth.uid() = expediteur_id);

-- =====================================================================
-- STEP 7: Create policies for NOTIFICATIONS table
-- =====================================================================

-- System can create notifications (via triggers)
CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- STEP 8: Create policies for AVIS table
-- =====================================================================

-- Clients can create reviews for completed jobs
CREATE POLICY "Clients can create reviews"
  ON public.avis FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.user_type = 'client'
    )
  );

-- Everyone can read reviews
CREATE POLICY "Anyone can read reviews"
  ON public.avis FOR SELECT
  TO authenticated
  USING (true);

-- Clients can update their own reviews
CREATE POLICY "Clients can update own reviews"
  ON public.avis FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- =====================================================================
-- VERIFICATION
-- =====================================================================

DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';

  RAISE NOTICE 'Total RLS policies created: %', policy_count;
END $$;
