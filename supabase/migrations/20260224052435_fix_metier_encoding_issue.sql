/*
  # Fix Metier Column Encoding Issue

  1. Problem
    - The `metier` column in `artisans` table is stored as TEXT
    - Contains JSON strings with escaped quotes: `[\"electricien\"]`
    - Causes backslash/escape character issues when parsing

  2. Solution
    - Convert metier from TEXT to TEXT[] (proper PostgreSQL array)
    - Parse existing JSON strings and extract clean values
    - Remove all backslashes and escape characters

  3. Changes
    - Add temporary column `metier_array` as TEXT[]
    - Parse JSON strings and populate array column
    - Drop old `metier` column
    - Rename `metier_array` to `metier`
    - Update NOT NULL constraint
*/

-- Step 1: Add temporary array column
ALTER TABLE artisans 
ADD COLUMN IF NOT EXISTS metier_array TEXT[];

-- Step 2: Parse JSON strings and populate array column
-- This handles the escaped JSON format like ["electricien"]
UPDATE artisans
SET metier_array = ARRAY(
  SELECT jsonb_array_elements_text(metier::jsonb)
)
WHERE metier IS NOT NULL;

-- Step 3: Drop old text column
ALTER TABLE artisans 
DROP COLUMN IF EXISTS metier;

-- Step 4: Rename array column to metier
ALTER TABLE artisans 
RENAME COLUMN metier_array TO metier;

-- Step 5: Add NOT NULL constraint with default
ALTER TABLE artisans 
ALTER COLUMN metier SET NOT NULL,
ALTER COLUMN metier SET DEFAULT ARRAY['non specifie'];

-- Step 6: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_artisans_metier 
ON artisans USING GIN(metier);
