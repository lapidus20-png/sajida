/*
  # Update metier field to support multiple trades

  This migration converts the metier column from a single text field
  to an array of text values, allowing artisans to have multiple specialties.

  Run this in your Supabase SQL Editor.
*/

-- Step 1: Add a temporary column for the array
ALTER TABLE artisans ADD COLUMN IF NOT EXISTS metier_array text[];

-- Step 2: Migrate existing data - convert single metier to array
UPDATE artisans
SET metier_array = ARRAY[metier]
WHERE metier_array IS NULL;

-- Step 3: Drop the old column
ALTER TABLE artisans DROP COLUMN metier;

-- Step 4: Rename the new column to metier
ALTER TABLE artisans RENAME COLUMN metier_array TO metier;

-- Step 5: Set default value for new records
ALTER TABLE artisans ALTER COLUMN metier SET DEFAULT ARRAY[]::text[];

-- Step 6: Make it not null
ALTER TABLE artisans ALTER COLUMN metier SET NOT NULL;

-- Verify the change
SELECT id, nom, prenom, metier FROM artisans LIMIT 5;
