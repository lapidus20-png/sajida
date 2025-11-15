/*
  # Add Admin Access Policies

  1. Changes
    - Add SELECT policies for admin users on all tables
    - Admins can view all users, jobs, quotes, reviews, etc.
    - Maintains existing user-level policies
    - Uses efficient subquery pattern for auth.uid()

  2. Security
    - Only users with user_type = 'admin' get full read access
    - Admin status is verified against the users table
    - Does not grant write/update/delete permissions (admins can only view)
*/

-- Allow admins to view all users
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND user_type = 'admin'
    )
  );

-- Allow admins to view all artisans
CREATE POLICY "Admins can view all artisans"
  ON public.artisans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND user_type = 'admin'
    )
  );

-- Allow admins to view all job requests
CREATE POLICY "Admins can view all job requests"
  ON public.job_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND user_type = 'admin'
    )
  );

-- Allow admins to view all quotes
CREATE POLICY "Admins can view all quotes"
  ON public.quotes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND user_type = 'admin'
    )
  );

-- Allow admins to view all reviews
CREATE POLICY "Admins can view all reviews"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND user_type = 'admin'
    )
  );

-- Allow admins to view all contracts
CREATE POLICY "Admins can view all contracts"
  ON public.contracts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND user_type = 'admin'
    )
  );

-- Allow admins to view all messages
CREATE POLICY "Admins can view all messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND user_type = 'admin'
    )
  );

-- Allow admins to view all services
CREATE POLICY "Admins can view all services"
  ON public.services
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND user_type = 'admin'
    )
  );

-- Allow admins to view all avis
CREATE POLICY "Admins can view all avis"
  ON public.avis
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND user_type = 'admin'
    )
  );

-- Allow admins to view all project timeline entries
CREATE POLICY "Admins can view all project timeline"
  ON public.project_timeline
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND user_type = 'admin'
    )
  );

-- Allow admins to view all admin logs
CREATE POLICY "Admins can view all admin logs"
  ON public.admin_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND user_type = 'admin'
    )
  );
