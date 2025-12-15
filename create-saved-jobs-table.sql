/*
  # Create saved_jobs table

  This table allows artisans to save/bookmark job opportunities
  for later review.

  Run this in your Supabase SQL Editor.
*/

-- Create saved_jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  job_request_id uuid NOT NULL REFERENCES job_requests(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(artisan_id, job_request_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_jobs_artisan_id ON saved_jobs(artisan_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_request_id ON saved_jobs(job_request_id);

-- Enable RLS
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Artisans can view their saved jobs" ON saved_jobs;
DROP POLICY IF EXISTS "Artisans can save jobs" ON saved_jobs;
DROP POLICY IF EXISTS "Artisans can unsave jobs" ON saved_jobs;

-- Create RLS policies
CREATE POLICY "Artisans can view their saved jobs"
  ON saved_jobs FOR SELECT
  TO authenticated
  USING (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can save jobs"
  ON saved_jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can unsave jobs"
  ON saved_jobs FOR DELETE
  TO authenticated
  USING (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );
