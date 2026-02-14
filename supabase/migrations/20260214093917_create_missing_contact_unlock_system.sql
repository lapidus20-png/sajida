/*
  # Create Contact Unlock System

  ## Overview
  This migration creates the missing table and functions needed for the contact information unlock system.

  ## New Tables
  
  ### `unlocked_client_details`
  Tracks which artisans have unlocked which clients' contact information
  - `id` (uuid, primary key)
  - `artisan_id` (uuid, references artisans) - The artisan who unlocked the contact
  - `client_id` (uuid, references users) - The client whose contact was unlocked
  - `job_request_id` (uuid, references job_requests) - Related job request
  - `unlock_cost` (integer) - Amount paid to unlock (in XOF)
  - `unlocked_at` (timestamptz) - When the unlock occurred
  
  ## New Functions
  
  ### `can_view_contact_info`
  Checks if an artisan can view a client's contact information
  - Parameters: artisan_id (uuid), client_id (uuid)
  - Returns: boolean
  
  ### `get_client_contact_info`
  Gets client contact information if artisan has access
  - Parameters: artisan_id (uuid), client_id (uuid)
  - Returns: JSON with contact info
  
  ## Security
  - RLS enabled on unlocked_client_details
  - Artisans can only view their own unlock records
  - Clients can see who unlocked their information
*/

-- Create unlocked_client_details table
CREATE TABLE IF NOT EXISTS unlocked_client_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_request_id uuid REFERENCES job_requests(id) ON DELETE SET NULL,
  unlock_cost integer NOT NULL DEFAULT 0,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(artisan_id, client_id)
);

-- Enable RLS
ALTER TABLE unlocked_client_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies for unlocked_client_details
CREATE POLICY "Artisans can view their own unlocks"
  ON unlocked_client_details
  FOR SELECT
  TO authenticated
  USING (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can see who unlocked their info"
  ON unlocked_client_details
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Artisans can insert unlock records"
  ON unlocked_client_details
  FOR INSERT
  TO authenticated
  WITH CHECK (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

-- Function: can_view_contact_info
CREATE OR REPLACE FUNCTION can_view_contact_info(
  p_artisan_id uuid,
  p_client_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if artisan has unlocked this client's contact info
  RETURN EXISTS (
    SELECT 1 
    FROM unlocked_client_details 
    WHERE artisan_id = p_artisan_id 
    AND client_id = p_client_id
  );
END;
$$;

-- Function: get_client_contact_info
CREATE OR REPLACE FUNCTION get_client_contact_info(
  p_artisan_id uuid,
  p_client_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_access boolean;
  v_result jsonb;
BEGIN
  -- Check if artisan has access
  v_has_access := can_view_contact_info(p_artisan_id, p_client_id);
  
  IF NOT v_has_access THEN
    RETURN jsonb_build_object(
      'error', 'Access denied',
      'message', 'You need to unlock this client''s contact information first'
    );
  END IF;
  
  -- Get client contact information
  SELECT jsonb_build_object(
    'email', u.email,
    'telephone', u.telephone,
    'adresse', u.adresse,
    'ville', u.ville
  )
  INTO v_result
  FROM users u
  WHERE u.id = p_client_id;
  
  RETURN v_result;
END;
$$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_unlocked_client_details_artisan_id 
  ON unlocked_client_details(artisan_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_client_details_client_id 
  ON unlocked_client_details(client_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_client_details_job_request_id 
  ON unlocked_client_details(job_request_id);
