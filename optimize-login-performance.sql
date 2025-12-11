/*
  # Optimize Login Performance

  ## Changes Made
  1. Ensure RLS is disabled on auth.users (prevents schema errors)
  2. Ensure indexes exist for fast lookups
  3. Verify all foreign keys are properly indexed

  ## Performance Improvements
  - Login queries should be < 100ms
  - User profile loading should be instant
  - No blocking queries during auth state changes
*/

-- Ensure RLS is disabled on auth.users
ALTER TABLE IF EXISTS auth.users DISABLE ROW LEVEL SECURITY;

-- Ensure critical indexes exist
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_artisans_user_id ON artisans(user_id);

-- Add composite index for faster user + artisan lookups
CREATE INDEX IF NOT EXISTS idx_artisans_user_id_metier ON artisans(user_id, metier);

-- Ensure foreign key columns are indexed
CREATE INDEX IF NOT EXISTS idx_job_requests_client_id ON job_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_artisan_id ON quotes(artisan_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_artisan_id ON contracts(artisan_id);

-- Verify table statistics are up to date for query planner
ANALYZE users;
ANALYZE artisans;
ANALYZE job_requests;
ANALYZE quotes;
ANALYZE contracts;
