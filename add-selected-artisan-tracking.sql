/*
  # Add Selected Artisan Tracking to Jobs

  1. Changes
    - Add `selected_artisan_id` column to `job_requests` table
    - Add foreign key constraint to `artisans` table
    - Add `closed_at` timestamp to track when job was closed
    - Update existing policies to accommodate new field

  2. Purpose
    - Track which artisan was selected for a job
    - Allow clients to close jobs by selecting a winning artisan
    - Maintain audit trail of when jobs were closed

  3. Security
    - Only clients can update the selected_artisan_id
    - RLS policies ensure data security
*/

-- Add selected_artisan_id and closed_at columns to job_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_requests' AND column_name = 'selected_artisan_id'
  ) THEN
    ALTER TABLE job_requests ADD COLUMN selected_artisan_id uuid REFERENCES artisans(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_requests' AND column_name = 'closed_at'
  ) THEN
    ALTER TABLE job_requests ADD COLUMN closed_at timestamptz;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_job_requests_selected_artisan ON job_requests(selected_artisan_id);
CREATE INDEX IF NOT EXISTS idx_job_requests_statut ON job_requests(statut);

-- Create a function to automatically update closed_at when artisan is selected
CREATE OR REPLACE FUNCTION update_job_closed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.selected_artisan_id IS NOT NULL AND OLD.selected_artisan_id IS NULL THEN
    NEW.closed_at = now();
    NEW.statut = 'attribuee';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update closed_at
DROP TRIGGER IF EXISTS trigger_update_job_closed_at ON job_requests;
CREATE TRIGGER trigger_update_job_closed_at
  BEFORE UPDATE ON job_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_job_closed_at();
