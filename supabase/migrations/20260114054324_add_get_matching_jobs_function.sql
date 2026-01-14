/*
  # Add get_matching_jobs function

  1. New Function
    - `get_matching_jobs()` - Returns job requests that match the current artisan's skills
    - Uses the artisan's metier_ids array to filter jobs by categorie_id
    - Security definer allows proper data access while maintaining RLS
    - Only returns jobs where the category ID matches any of the artisan's trade IDs

  2. Purpose
    - Enables artisans to efficiently find jobs matching their skills
    - Simplifies job discovery in the application layer
*/

CREATE OR REPLACE FUNCTION get_matching_jobs()
RETURNS SETOF job_requests
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT jr.*
  FROM job_requests jr
  JOIN artisans a ON a.user_id = auth.uid()
  WHERE jr.categorie_id = ANY(a.metier_ids);
$$;
