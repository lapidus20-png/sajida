-- Create client_documents table for file uploads
-- This allows clients to upload, manage, and download documents and photos

CREATE TABLE IF NOT EXISTS client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_request_id uuid REFERENCES job_requests(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own documents" ON client_documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON client_documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON client_documents;

-- Create RLS policies
-- Clients can only view their own documents
CREATE POLICY "Users can view own documents"
  ON client_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Clients can only insert their own documents
CREATE POLICY "Users can insert own documents"
  ON client_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Clients can only delete their own documents
CREATE POLICY "Users can delete own documents"
  ON client_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_documents_user_id ON client_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_job_request_id ON client_documents(job_request_id);
