-- Fix artisan foreign key constraint issue
-- This ensures the user_id column exists and can be null

-- Add user_id column if it doesn't exist (should already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE artisans ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add latitude and longitude columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE artisans ADD COLUMN latitude decimal(10, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE artisans ADD COLUMN longitude decimal(11, 8);
  END IF;
END $$;

-- Also add to job_requests table if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_requests' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE job_requests ADD COLUMN latitude decimal(10, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_requests' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE job_requests ADD COLUMN longitude decimal(11, 8);
  END IF;
END $$;
