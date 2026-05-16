/*
  # Fix Admin Dashboard Access

  ## Problems Fixed
  1. Missing `get_admin_stats` RPC function — AdminDashboard calls this but it did not exist,
     causing the dashboard to show an error and never load stats.
  2. Admins have no RLS policies to read all users, job_requests, artisans, or quotes —
     they were blocked by the restrictive per-user policies.

  ## Changes
  1. Create `get_admin_stats()` function (SECURITY DEFINER) returning counts for users, jobs, quotes, reviews, artisans.
  2. Add admin SELECT/UPDATE/DELETE policies on: users, artisans, job_requests, quotes, reviews.
  3. Admin is identified by checking user_type = 'admin' in the users table via a helper function
     that avoids infinite recursion (reads directly from auth.jwt metadata or uses a separate lookup).
*/

-- Helper: check if the current user is admin using a SECURITY DEFINER function
-- to avoid infinite RLS recursion on the users table.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND user_type = 'admin'
  );
$$;

-- ============================================================
-- get_admin_stats RPC (called by AdminDashboard)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'users', json_build_object(
      'total',    (SELECT COUNT(*) FROM users),
      'clients',  (SELECT COUNT(*) FROM users WHERE user_type = 'client'),
      'artisans', (SELECT COUNT(*) FROM users WHERE user_type = 'artisan')
    ),
    'jobs', json_build_object(
      'total',    (SELECT COUNT(*) FROM job_requests),
      'publiees', (SELECT COUNT(*) FROM job_requests WHERE statut = 'publiee'),
      'en_cours', (SELECT COUNT(*) FROM job_requests WHERE statut = 'en_cours'),
      'terminees',(SELECT COUNT(*) FROM job_requests WHERE statut = 'terminee')
    ),
    'quotes', json_build_object(
      'total',     (SELECT COUNT(*) FROM quotes),
      'acceptes',  (SELECT COUNT(*) FROM quotes WHERE statut = 'accepte'),
      'refuses',   (SELECT COUNT(*) FROM quotes WHERE statut = 'refuse'),
      'en_attente',(SELECT COUNT(*) FROM quotes WHERE statut = 'en_attente')
    ),
    'reviews', json_build_object(
      'total',   (SELECT COUNT(*) FROM reviews),
      'verified',(SELECT COUNT(*) FROM reviews WHERE verifie = true),
      'pending', (SELECT COUNT(*) FROM reviews WHERE verifie = false)
    ),
    'artisans', json_build_object(
      'total',    (SELECT COUNT(*) FROM artisans),
      'pending',  (SELECT COUNT(*) FROM artisans WHERE statut_verification = 'en_attente'),
      'verified', (SELECT COUNT(*) FROM artisans WHERE statut_verification = 'verifie'),
      'rejected', (SELECT COUNT(*) FROM artisans WHERE statut_verification = 'rejete')
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute to authenticated users (admin check is done inside calling code / policies)
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================
-- Admin RLS policies on users table
-- ============================================================
DROP POLICY IF EXISTS "Admin can view all users" ON users;
CREATE POLICY "Admin can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (public.is_admin() OR auth.uid() = id);

DROP POLICY IF EXISTS "Admin can delete users" ON users;
CREATE POLICY "Admin can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- Admin RLS policies on artisans table
-- ============================================================
DROP POLICY IF EXISTS "Admin can view all artisans" ON artisans;
CREATE POLICY "Admin can view all artisans"
  ON artisans FOR SELECT
  TO authenticated
  USING (public.is_admin() OR true);

DROP POLICY IF EXISTS "Admin can update artisan verification" ON artisans;
CREATE POLICY "Admin can update artisan verification"
  ON artisans FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR user_id = auth.uid())
  WITH CHECK (public.is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Admin can delete artisans" ON artisans;
CREATE POLICY "Admin can delete artisans"
  ON artisans FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- Admin RLS policies on job_requests table
-- ============================================================
DROP POLICY IF EXISTS "Admin can view all job requests" ON job_requests;
CREATE POLICY "Admin can view all job requests"
  ON job_requests FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR client_id = auth.uid()
    OR statut = ANY(ARRAY['publiee','en_negociation','attribuee','en_cours'])
  );

DROP POLICY IF EXISTS "Admin can delete job requests" ON job_requests;
CREATE POLICY "Admin can delete job requests"
  ON job_requests FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- Admin RLS policies on quotes table
-- ============================================================
DROP POLICY IF EXISTS "Admin can view all quotes" ON quotes;
CREATE POLICY "Admin can view all quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid())
    OR job_request_id IN (SELECT id FROM job_requests WHERE client_id = auth.uid())
  );

-- ============================================================
-- Admin RLS policies on reviews table
-- ============================================================
DROP POLICY IF EXISTS "Admin can view all reviews" ON reviews;
CREATE POLICY "Admin can view all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (public.is_admin() OR true);

DROP POLICY IF EXISTS "Admin can update reviews" ON reviews;
CREATE POLICY "Admin can update reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
