/*
  # Add Category ID to Job Requests

  1. Changes
    - Add `categorie_id` column to `job_requests` table
    - Column is an integer that references `categories(id)`
    - Column is nullable to allow existing records and gradual migration
  
  2. Purpose
    - Link job requests to specific categories (Électricité, Plomberie, Couture)
    - Enable better filtering and categorization of job requests
    - Support artisan-job matching based on categories
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_requests' AND column_name = 'categorie_id'
  ) THEN
    ALTER TABLE job_requests 
    ADD COLUMN categorie_id int REFERENCES categories(id);
  END IF;
END $$;
