# Setup Saved Jobs Feature

The saved jobs feature allows artisans to bookmark job opportunities for later review. This table needs to be created in your Supabase database.

## Instructions

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the SQL below
6. Click **Run** to execute

## SQL to Execute

```sql
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
```

## Verification

After running the SQL, verify the table was created:

```bash
npm run check-saved-jobs
```

Or check manually in Supabase:
1. Go to **Table Editor**
2. Look for `saved_jobs` table in the list

## Features

Once the table is created, artisans will be able to:
- Save job opportunities by clicking the bookmark icon
- View all saved jobs in the "Opportunités sauvegardées" tab
- Unsave jobs they no longer want to track
- Saved jobs persist across sessions

## Table Structure

- **id**: Unique identifier for each saved job entry
- **artisan_id**: Reference to the artisan who saved the job
- **job_request_id**: Reference to the job that was saved
- **created_at**: Timestamp when the job was saved
- **Unique constraint**: Prevents duplicate saves of the same job by the same artisan

## Security

Row Level Security (RLS) is enabled to ensure:
- Artisans can only view their own saved jobs
- Artisans can only save/unsave their own jobs
- No unauthorized access to saved jobs data
