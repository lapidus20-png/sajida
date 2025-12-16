-- ============================================
-- FIX: Add budget column to job_requests table
-- ============================================
-- Run this SQL in your Supabase SQL Editor to add the budget column
-- Dashboard > SQL Editor > New query > Paste this SQL > Run

-- Step 1: Add budget column to job_requests table
ALTER TABLE job_requests ADD COLUMN IF NOT EXISTS budget integer DEFAULT 0;

-- Step 2: Create unlocked_client_details table if it doesn't exist
CREATE TABLE IF NOT EXISTS unlocked_client_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL REFERENCES job_requests(id) ON DELETE CASCADE,
  artisan_id uuid NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  unlock_fee_paid integer NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  unlocked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_request_id, artisan_id)
);

-- Step 3: Enable RLS on unlocked_client_details
ALTER TABLE unlocked_client_details ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Artisans can view own unlock records" ON unlocked_client_details;
DROP POLICY IF EXISTS "Artisans can create unlock records" ON unlocked_client_details;
DROP POLICY IF EXISTS "Artisans can update own unlock records" ON unlocked_client_details;

-- Step 5: Create RLS policies for unlocked_client_details
CREATE POLICY "Artisans can view own unlock records"
  ON unlocked_client_details
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = unlocked_client_details.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can create unlock records"
  ON unlocked_client_details
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = unlocked_client_details.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

CREATE POLICY "Artisans can update own unlock records"
  ON unlocked_client_details
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = unlocked_client_details.artisan_id
      AND artisans.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = unlocked_client_details.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_unlocked_client_details_artisan
  ON unlocked_client_details(artisan_id);

CREATE INDEX IF NOT EXISTS idx_unlocked_client_details_job_request
  ON unlocked_client_details(job_request_id);

-- Step 7: Verify the budget column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'job_requests' AND column_name = 'budget';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Budget column and unlock system successfully set up!';
END $$;
