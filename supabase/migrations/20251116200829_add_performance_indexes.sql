/*
  # Add Performance Indexes for Faster Queries

  1. Purpose
    - Speed up login and data loading queries
    - Improve RLS policy performance
    - Optimize common query patterns

  2. Indexes Added
    - users.email for login lookups
    - artisans.user_id for profile loading
    - job_requests.client_id for client queries
    - quotes.artisan_id and job_request_id for quote lookups
    - contracts.client_id and artisan_id for contract queries
    - messages.sender_id and recipient_id for message queries

  3. Impact
    - Significantly faster login times
    - Reduced database query latency
    - Better RLS policy performance
*/

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);

-- Artisans table indexes
CREATE INDEX IF NOT EXISTS idx_artisans_user_id ON artisans(user_id);
CREATE INDEX IF NOT EXISTS idx_artisans_ville ON artisans(ville);
CREATE INDEX IF NOT EXISTS idx_artisans_metier ON artisans(metier);
CREATE INDEX IF NOT EXISTS idx_artisans_statut_verification ON artisans(statut_verification);

-- Services table indexes
CREATE INDEX IF NOT EXISTS idx_services_artisan_id ON services(artisan_id);

-- Avis table indexes
CREATE INDEX IF NOT EXISTS idx_avis_artisan_id ON avis(artisan_id);
CREATE INDEX IF NOT EXISTS idx_avis_service_id ON avis(service_id);

-- Job requests table indexes
CREATE INDEX IF NOT EXISTS idx_job_requests_client_id ON job_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_job_requests_statut ON job_requests(statut);
CREATE INDEX IF NOT EXISTS idx_job_requests_ville ON job_requests(ville);

-- Quotes table indexes
CREATE INDEX IF NOT EXISTS idx_quotes_job_request_id ON quotes(job_request_id);
CREATE INDEX IF NOT EXISTS idx_quotes_artisan_id ON quotes(artisan_id);
CREATE INDEX IF NOT EXISTS idx_quotes_statut ON quotes(statut);

-- Contracts table indexes
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_artisan_id ON contracts(artisan_id);
CREATE INDEX IF NOT EXISTS idx_contracts_job_request_id ON contracts(job_request_id);
CREATE INDEX IF NOT EXISTS idx_contracts_quote_id ON contracts(quote_id);
CREATE INDEX IF NOT EXISTS idx_contracts_statut ON contracts(statut);

-- Project timeline table indexes
CREATE INDEX IF NOT EXISTS idx_project_timeline_contract_id ON project_timeline(contract_id);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_job_request_id ON messages(job_request_id);
CREATE INDEX IF NOT EXISTS idx_messages_quote_id ON messages(quote_id);
CREATE INDEX IF NOT EXISTS idx_messages_lu ON messages(lu);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_contract_id ON reviews(contract_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(verified);

-- Admin logs table indexes
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
