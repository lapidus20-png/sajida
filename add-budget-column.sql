/*
  # Add budget column and brouillon status to job_requests

  1. Changes
    - Add `budget` column (integer) to job_requests table for simple budget field
    - Add `latitude` and `longitude` columns for geolocation if not exists
    - Update statut CHECK constraint to include 'brouillon' status

  2. Notes
    - budget column allows clients to specify a single budget amount
    - brouillon status allows clients to save drafts before publishing
    - Existing budget_min and budget_max columns remain for backward compatibility
*/

-- Add budget column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_requests' AND column_name = 'budget'
  ) THEN
    ALTER TABLE job_requests ADD COLUMN budget integer DEFAULT 0;
  END IF;
END $$;

-- Add latitude column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_requests' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE job_requests ADD COLUMN latitude decimal(10, 8);
  END IF;
END $$;

-- Add longitude column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_requests' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE job_requests ADD COLUMN longitude decimal(11, 8);
  END IF;
END $$;

-- Drop the existing CHECK constraint on statut
ALTER TABLE job_requests DROP CONSTRAINT IF EXISTS job_requests_statut_check;

-- Add updated CHECK constraint that includes 'brouillon'
ALTER TABLE job_requests ADD CONSTRAINT job_requests_statut_check
  CHECK (statut IN ('brouillon', 'publiee', 'en_negociation', 'attribuee', 'en_cours', 'terminee', 'annulee'));

-- Update default status to brouillon for new jobs
ALTER TABLE job_requests ALTER COLUMN statut SET DEFAULT 'brouillon';
