/*
  # Fix Admin Policies Infinite Recursion

  1. Problem
    - Admin policies were checking users table to verify admin status
    - This created infinite recursion when reading users table
    - Policy needs to read users table to check if user is admin, 
      which triggers the policy again

  2. Solution
    - Remove the recursive admin check policies
    - Add simpler admin policies that don't create recursion
    - For users table: Allow authenticated users to read where they are admin
      using a direct check that doesn't recurse
    - For other tables: Use auth.jwt() to check user_type from JWT metadata
      OR use a function with SECURITY DEFINER

  3. Implementation
    - Drop problematic admin policies
    - Create new non-recursive policies
    - Admins can view all data without recursion issues
*/

-- Drop all the problematic admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all artisans" ON public.artisans;
DROP POLICY IF EXISTS "Admins can view all job requests" ON public.job_requests;
DROP POLICY IF EXISTS "Admins can view all quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can view all contracts" ON public.contracts;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can view all services" ON public.services;
DROP POLICY IF EXISTS "Admins can view all avis" ON public.avis;
DROP POLICY IF EXISTS "Admins can view all project timeline" ON public.project_timeline;
DROP POLICY IF EXISTS "Admins can view all admin logs" ON public.admin_logs;

-- Create a function to check if current user is admin (with SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND user_type = 'admin'
  );
$$;

-- Now create admin policies using this function (no recursion!)

-- Users table: Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Artisans table
CREATE POLICY "Admins can view all artisans"
  ON public.artisans
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Job requests table
CREATE POLICY "Admins can view all job requests"
  ON public.job_requests
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Quotes table
CREATE POLICY "Admins can view all quotes"
  ON public.quotes
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Reviews table
CREATE POLICY "Admins can view all reviews"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Contracts table
CREATE POLICY "Admins can view all contracts"
  ON public.contracts
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Messages table
CREATE POLICY "Admins can view all messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Services table
CREATE POLICY "Admins can view all services"
  ON public.services
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Avis table
CREATE POLICY "Admins can view all avis"
  ON public.avis
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Project timeline table
CREATE POLICY "Admins can view all project timeline"
  ON public.project_timeline
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admin logs table
CREATE POLICY "Admins can view all admin logs"
  ON public.admin_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());
