/*
  # Dashboard Performance Optimizations
  
  1. Functions
    - Add optimized statistics functions for admin dashboard
    - Add view for faster data access
  
  2. Indexes
    - Add composite indexes for common query patterns
    
  3. Performance
    - Use database aggregations instead of client-side filtering
    - Reduce number of queries needed
*/

-- Create materialized view for admin stats (optional, for very large datasets)
-- For now, we'll use functions for real-time data

-- Function to get admin statistics efficiently
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'users', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM users),
      'clients', (SELECT COUNT(*) FROM users WHERE user_type = 'client'),
      'artisans', (SELECT COUNT(*) FROM users WHERE user_type = 'artisan')
    ),
    'jobs', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM job_requests),
      'publiees', (SELECT COUNT(*) FROM job_requests WHERE statut = 'publiee'),
      'en_cours', (SELECT COUNT(*) FROM job_requests WHERE statut = 'en_cours'),
      'terminees', (SELECT COUNT(*) FROM job_requests WHERE statut = 'terminee')
    ),
    'quotes', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM quotes),
      'acceptes', (SELECT COUNT(*) FROM quotes WHERE statut = 'accepte'),
      'refuses', (SELECT COUNT(*) FROM quotes WHERE statut = 'refuse'),
      'en_attente', (SELECT COUNT(*) FROM quotes WHERE statut = 'en_attente')
    ),
    'reviews', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM reviews),
      'verified', (SELECT COUNT(*) FROM reviews WHERE verified = true),
      'pending', (SELECT COUNT(*) FROM reviews WHERE verified = false OR verified IS NULL)
    ),
    'artisans', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM artisans),
      'pending', (SELECT COUNT(*) FROM artisans WHERE statut_verification = 'en_attente'),
      'verified', (SELECT COUNT(*) FROM artisans WHERE statut_verification = 'verifie'),
      'rejected', (SELECT COUNT(*) FROM artisans WHERE statut_verification = 'rejete')
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Add composite index for user type filtering with created_at ordering
CREATE INDEX IF NOT EXISTS idx_users_type_created_at 
ON users(user_type, created_at DESC);

-- Add composite index for job requests filtering
CREATE INDEX IF NOT EXISTS idx_job_requests_client_statut_created_at 
ON job_requests(client_id, statut, created_at DESC);

-- Add composite index for quotes with job_request lookup
CREATE INDEX IF NOT EXISTS idx_quotes_job_artisan_created_at 
ON quotes(job_request_id, artisan_id, created_at DESC);

-- Add index for quotes by artisan with status filtering
CREATE INDEX IF NOT EXISTS idx_quotes_artisan_statut_created_at 
ON quotes(artisan_id, statut, created_at DESC);

-- Analyze tables to update query planner statistics
ANALYZE users;
ANALYZE job_requests;
ANALYZE quotes;
ANALYZE reviews;
ANALYZE artisans;
ANALYZE contracts;
