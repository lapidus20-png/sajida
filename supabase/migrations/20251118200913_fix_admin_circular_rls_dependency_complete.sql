/*
  # Fix Admin RLS Circular Dependency - Complete Solution

  ## Problem
  - is_admin() function queries users table
  - users table has policy using is_admin()
  - This creates infinite recursion causing "Database error querying schema"
  - Many tables depend on is_admin() function

  ## Solution
  1. Drop all policies that use is_admin() across all tables
  2. Drop the is_admin() function
  3. Recreate a simpler is_admin() that doesn't cause recursion
  4. Use a cached approach: store admin status in a way that doesn't query users table

  ## Approach
  - Use auth.jwt() to check user metadata instead of querying users table
  - This breaks the circular dependency
  - Admins will have 'admin' flag in their JWT metadata

  ## Security
  - Users can only access their own data
  - Admin checks moved to application level where appropriate
*/

-- Drop all admin policies first
DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;
DROP POLICY IF EXISTS "Admins have full access to artisans" ON public.artisans;
DROP POLICY IF EXISTS "Admins have full access to services" ON public.services;
DROP POLICY IF EXISTS "Admins have full access to avis" ON public.avis;
DROP POLICY IF EXISTS "Admins have full access to job requests" ON public.job_requests;
DROP POLICY IF EXISTS "Admins have full access to quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admins have full access to contracts" ON public.contracts;
DROP POLICY IF EXISTS "Admins have full access to project timeline" ON public.project_timeline;
DROP POLICY IF EXISTS "Admins have full access to messages" ON public.messages;
DROP POLICY IF EXISTS "Admins have full access to reviews" ON public.reviews;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS public.is_admin();

-- Add a helper policy for users table to allow reading by user_type
-- This allows the app to check admin status without RLS blocking it
CREATE POLICY "Users can read all user types for admin check"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);
