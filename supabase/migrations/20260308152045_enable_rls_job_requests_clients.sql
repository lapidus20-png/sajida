/*
  # Enable RLS on job_requests and add client read policy

  1. Security Changes
    - Enable Row Level Security on job_requests table
    - Add policy for clients to read their own jobs
  
  2. Policy Details
    - Name: "Clients can read own jobs"
    - Table: job_requests
    - Action: SELECT
    - Target: authenticated users
    - Condition: client_id matches authenticated user's ID
  
  3. Notes
    - This ensures clients can only view their own job requests
    - Only affects SELECT operations (reading data)
*/

-- Enable RLS on job_requests table
ALTER TABLE job_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Clients can read own jobs" ON job_requests;

-- Create policy for clients to read their own jobs
CREATE POLICY "Clients can read own jobs"
  ON job_requests
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());