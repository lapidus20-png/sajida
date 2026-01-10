-- ============================================================================
-- Migration: Add Artisan Selection and Job Closure Tracking
-- ============================================================================
-- This migration adds the ability for clients to select artisans and
-- automatically close jobs.
--
-- RUN THIS IN: Supabase Dashboard → SQL Editor → New Query
-- ============================================================================

-- Step 1: Add selected_artisan_id column to track which artisan was chosen
ALTER TABLE job_requests
ADD COLUMN IF NOT EXISTS selected_artisan_id uuid
REFERENCES artisans(id) ON DELETE SET NULL;

-- Step 2: Add closed_at timestamp to track when job was closed
ALTER TABLE job_requests
ADD COLUMN IF NOT EXISTS closed_at timestamptz;

-- Step 3: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_requests_selected_artisan
ON job_requests(selected_artisan_id);

CREATE INDEX IF NOT EXISTS idx_job_requests_statut
ON job_requests(statut);

-- Step 4: Create function to automatically update closed_at when artisan is selected
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

-- Step 5: Create trigger to call the function
DROP TRIGGER IF EXISTS trigger_update_job_closed_at ON job_requests;

CREATE TRIGGER trigger_update_job_closed_at
  BEFORE UPDATE ON job_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_job_closed_at();

-- ============================================================================
-- Verification Query (run this after to confirm):
-- ============================================================================
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'job_requests'
-- AND column_name IN ('selected_artisan_id', 'closed_at');
-- ============================================================================
