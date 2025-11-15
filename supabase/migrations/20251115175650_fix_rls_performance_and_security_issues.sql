/*
  # Fix RLS Performance and Security Issues

  1. Performance Improvements
    - Optimize RLS policies by wrapping auth.uid() calls in SELECT subqueries
    - This prevents re-evaluation of auth functions for each row
    - Applies to: users table (3 policies) and artisans table (3 policies)

  2. Index Cleanup
    - Remove unused indexes that aren't being utilized
    - Reduces storage overhead and improves write performance
    - Removes 16 unused indexes across multiple tables

  3. Policy Consolidation
    - Merge duplicate permissive SELECT policies on reviews table
    - Simplifies policy evaluation and improves query performance

  4. Security Notes
    - All policies maintain the same security guarantees
    - Only the performance characteristics are improved
    - Data access patterns remain unchanged
*/

-- ============================================================================
-- 1. OPTIMIZE RLS POLICIES FOR PERFORMANCE
-- ============================================================================

-- Drop and recreate users table policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Allow user profile creation during signup" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Allow user profile creation during signup"
  ON public.users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Drop and recreate artisans table policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Authenticated users can create artisan profile" ON public.artisans;
DROP POLICY IF EXISTS "Artisans can update own profile" ON public.artisans;
DROP POLICY IF EXISTS "Artisans can delete own profile" ON public.artisans;

CREATE POLICY "Authenticated users can create artisan profile"
  ON public.artisans
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Artisans can update own profile"
  ON public.artisans
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Artisans can delete own profile"
  ON public.artisans
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================================================

-- Job requests indexes
DROP INDEX IF EXISTS public.idx_job_requests_categorie;
DROP INDEX IF EXISTS public.idx_job_requests_ville;

-- Quotes indexes
DROP INDEX IF EXISTS public.idx_quotes_job_request;
DROP INDEX IF EXISTS public.idx_quotes_statut;

-- Contracts indexes
DROP INDEX IF EXISTS public.idx_contracts_statut;
DROP INDEX IF EXISTS public.idx_contracts_job_request_id;
DROP INDEX IF EXISTS public.idx_contracts_quote_id;

-- Project timeline indexes
DROP INDEX IF EXISTS public.idx_timeline_contract;

-- Reviews indexes
DROP INDEX IF EXISTS public.idx_reviews_contract_id;
DROP INDEX IF EXISTS public.idx_reviews_verified;

-- Avis indexes
DROP INDEX IF EXISTS public.idx_avis_service_id;

-- Messages indexes
DROP INDEX IF EXISTS public.idx_messages_job_request_id;
DROP INDEX IF EXISTS public.idx_messages_quote_id;

-- Artisans indexes
DROP INDEX IF EXISTS public.idx_artisans_metier;
DROP INDEX IF EXISTS public.idx_artisans_ville;

-- Services indexes
DROP INDEX IF EXISTS public.idx_services_statut;

-- ============================================================================
-- 3. CONSOLIDATE DUPLICATE POLICIES
-- ============================================================================

-- Drop duplicate SELECT policies on reviews table and create single unified policy
DROP POLICY IF EXISTS "Les utilisateurs ne voient que leurs avis" ON public.reviews;
DROP POLICY IF EXISTS "Tout le monde peut voir les avis vérifiés" ON public.reviews;

CREATE POLICY "Users can view relevant reviews"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see their own reviews (as reviewer or reviewed)
    ((SELECT auth.uid()) = reviewer_id OR (SELECT auth.uid()) = reviewed_user_id)
    -- OR verified reviews are visible to all
    OR verified = true
  );

-- Add public access for verified reviews (anon users)
CREATE POLICY "Public can view verified reviews"
  ON public.reviews
  FOR SELECT
  TO anon
  USING (verified = true);
