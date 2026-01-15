/*
  # Add Normalized Category Keys

  1. Changes to Tables
    - `job_requests`
      - Add `categorie_key` (text) - Normalized category identifier (e.g., 'electricite', 'plomberie')
    
    - `artisans`
      - Add `metier_key` (text) - Normalized trade/profession identifier (e.g., 'electricite', 'plomberie')
  
  2. Purpose
    - Provides standardized, normalized keys for matching jobs with artisans
    - Enables efficient filtering and searching by category/trade
    - Simplifies category-based queries and recommendations
  
  3. Notes
    - Both columns are nullable to allow gradual migration of existing data
    - Keys should be lowercase, URL-safe identifiers (e.g., 'electricite', 'plomberie', 'menuiserie')
    - These keys complement existing category/metier fields for better data consistency
*/

-- Add categorie_key to job_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_requests' AND column_name = 'categorie_key'
  ) THEN
    ALTER TABLE job_requests ADD COLUMN categorie_key TEXT;
  END IF;
END $$;

-- Add metier_key to artisans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'metier_key'
  ) THEN
    ALTER TABLE artisans ADD COLUMN metier_key TEXT;
  END IF;
END $$;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_job_requests_categorie_key ON job_requests(categorie_key);
CREATE INDEX IF NOT EXISTS idx_artisans_metier_key ON artisans(metier_key);
