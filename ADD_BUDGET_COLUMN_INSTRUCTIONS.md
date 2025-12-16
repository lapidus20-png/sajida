# Fix: Add Budget Column to job_requests Table

The application is trying to use a `budget` column that doesn't exist in the database yet.

## Quick Fix

Run this SQL in your **Supabase SQL Editor**:

### Option 1: Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: `fldkqlardekarhibnyyx`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Paste the SQL below and click **Run**

### SQL to Execute

```sql
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
```

### What This Does

1. Adds `budget` column (integer) for single budget values
2. Adds `latitude` and `longitude` columns for geolocation
3. Adds `brouillon` (draft) status to the allowed statuses
4. Sets default status to `brouillon` so new jobs start as drafts

### Verify It Worked

After running the SQL, you should see a success message. The application will now work properly with:
- Job creation starting as drafts
- Budget field working correctly
- Publish/unpublish functionality active
