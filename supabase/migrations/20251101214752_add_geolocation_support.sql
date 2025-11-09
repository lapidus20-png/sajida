/*
  # Ajout de la géolocalisation et calcul des distances

  1. Modifications
    - Ajouter coordonnées GPS (latitude, longitude) aux artisans
    - Ajouter coordonnées GPS aux demandes de travaux (job_requests)
    - Créer fonction pour calculer la distance entre deux points

  2. Notes
    - Utilise la formule Haversine pour calcul de distance
    - Distances retournées en kilomètres
    - Extension PostGIS optionnelle pour performances avancées
*/

-- Ajouter colonnes de géolocalisation aux artisans
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

-- Ajouter colonnes de géolocalisation aux demandes de travaux
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_requests' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE job_requests ADD COLUMN latitude numeric(10, 8);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_requests' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE job_requests ADD COLUMN longitude numeric(11, 8);
  END IF;
END $$;

-- Fonction pour calculer la distance entre deux points (formule Haversine)
-- Retourne la distance en kilomètres
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
)
RETURNS numeric AS $$
DECLARE
  r numeric := 6371; -- Rayon de la Terre en km
  dlat numeric;
  dlon numeric;
  a numeric;
  c numeric;
  distance numeric;
BEGIN
  -- Vérifier que les coordonnées ne sont pas nulles
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;

  -- Convertir les degrés en radians
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);

  -- Formule Haversine
  a := sin(dlat / 2) * sin(dlat / 2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dlon / 2) * sin(dlon / 2);
  c := 2 * atan2(sqrt(a), sqrt(1 - a));
  distance := r * c;

  RETURN ROUND(distance, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Index pour améliorer les requêtes géographiques
CREATE INDEX IF NOT EXISTS idx_artisans_location ON artisans(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_job_requests_location ON job_requests(latitude, longitude);

-- Commentaires pour documentation
COMMENT ON COLUMN artisans.latitude IS 'Latitude GPS de l''artisan (WGS84)';
COMMENT ON COLUMN artisans.longitude IS 'Longitude GPS de l''artisan (WGS84)';
COMMENT ON COLUMN job_requests.latitude IS 'Latitude GPS du lieu des travaux (WGS84)';
COMMENT ON COLUMN job_requests.longitude IS 'Longitude GPS du lieu des travaux (WGS84)';
COMMENT ON FUNCTION calculate_distance IS 'Calcule la distance en km entre deux points GPS (formule Haversine)';
