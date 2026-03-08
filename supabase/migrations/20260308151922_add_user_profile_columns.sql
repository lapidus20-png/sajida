/*
  # Add user profile columns

  1. Changes
    - Add `nom` (last name) column to users table
    - Add `prenom` (first name) column to users table
    - Add `avatar_url` (profile picture URL) column to users table
  
  2. Notes
    - All columns are nullable to allow existing users to continue functioning
    - These columns enhance user profile information
*/

-- Add profile columns to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'nom'
  ) THEN
    ALTER TABLE users ADD COLUMN nom text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'prenom'
  ) THEN
    ALTER TABLE users ADD COLUMN prenom text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url text;
  END IF;
END $$;