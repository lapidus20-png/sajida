/*
  # Fix Artisans Schema - Add Missing Columns

  1. Modifications
    - Ensure latitude and longitude columns exist on artisans table
    - Ensure all required columns from extended schema exist
    - Add indexes for performance

  2. Security
    - No changes to RLS policies
    - Maintains existing foreign key constraints

  3. Notes
    - Safe to run multiple times (uses IF NOT EXISTS checks)
    - Adds geolocation support for distance-based filtering

  To apply this migration:
  1. Go to your Supabase dashboard
  2. Navigate to SQL Editor
  3. Copy and paste this entire file
  4. Click "Run" to execute
*/

-- Ensure geolocation columns exist on artisans table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE artisans ADD COLUMN latitude numeric(10, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE artisans ADD COLUMN longitude numeric(11, 8);
  END IF;
END $$;

-- Ensure user_id column exists with proper foreign key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE artisans ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure email column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'email'
  ) THEN
    ALTER TABLE artisans ADD COLUMN email text DEFAULT '';
  END IF;
END $$;

-- Ensure adresse column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'adresse'
  ) THEN
    ALTER TABLE artisans ADD COLUMN adresse text DEFAULT '';
  END IF;
END $$;

-- Ensure portefeuille column exists (for portfolio images)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'portefeuille'
  ) THEN
    ALTER TABLE artisans ADD COLUMN portefeuille text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;

-- Ensure certifications column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'certifications'
  ) THEN
    ALTER TABLE artisans ADD COLUMN certifications text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;

-- Ensure assurance_rcpro column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'assurance_rcpro'
  ) THEN
    ALTER TABLE artisans ADD COLUMN assurance_rcpro boolean DEFAULT false;
  END IF;
END $$;

-- Ensure statut_verification column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'statut_verification'
  ) THEN
    ALTER TABLE artisans ADD COLUMN statut_verification text DEFAULT 'en_attente' CHECK (statut_verification IN ('en_attente', 'verifie', 'rejete'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artisans_location ON artisans(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_artisans_user_id ON artisans(user_id);

-- Add comments for documentation
COMMENT ON COLUMN artisans.latitude IS 'Latitude GPS de l''artisan (WGS84)';
COMMENT ON COLUMN artisans.longitude IS 'Longitude GPS de l''artisan (WGS84)';
COMMENT ON COLUMN artisans.user_id IS 'Référence vers le compte utilisateur (auth.users)';
