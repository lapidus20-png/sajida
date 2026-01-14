/*
  # Update get_matching_jobs function to include category label

  1. Changes
    - Modified `get_matching_jobs()` to return job requests with category labels
    - Joins with categories table to fetch the label field
    - Returns all job_requests fields plus categorie_label

  2. Purpose
    - Enables Flutter UI to display human-readable category names
    - Eliminates need for separate category lookup in the app
*/

DROP FUNCTION IF EXISTS get_matching_jobs();

CREATE OR REPLACE FUNCTION get_matching_jobs()
RETURNS TABLE (
  id uuid,
  client_id uuid,
  titre text,
  description text,
  categorie text,
  categorie_id integer,
  categorie_label text,
  localisation text,
  ville text,
  budget_min integer,
  budget_max integer,
  date_souhaitee date,
  date_limite_devis date,
  statut text,
  images_url text[],
  latitude numeric,
  longitude numeric,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    jr.id,
    jr.client_id,
    jr.titre,
    jr.description,
    jr.categorie,
    jr.categorie_id,
    c.label as categorie_label,
    jr.localisation,
    jr.ville,
    jr.budget_min,
    jr.budget_max,
    jr.date_souhaitee,
    jr.date_limite_devis,
    jr.statut,
    jr.images_url,
    jr.latitude,
    jr.longitude,
    jr.created_at,
    jr.updated_at
  FROM job_requests jr
  JOIN artisans a ON a.user_id = auth.uid()
  JOIN categories c ON c.id = jr.categorie_id
  WHERE jr.categorie_id = ANY(a.metier_ids);
$$;
