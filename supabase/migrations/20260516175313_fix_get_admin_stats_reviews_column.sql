/*
  # Fix get_admin_stats — correct reviews column name
  The reviews table uses "verified" (not "verifie"). Update the function accordingly.
*/

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'users', json_build_object(
      'total',    (SELECT COUNT(*) FROM users),
      'clients',  (SELECT COUNT(*) FROM users WHERE user_type = 'client'),
      'artisans', (SELECT COUNT(*) FROM users WHERE user_type = 'artisan')
    ),
    'jobs', json_build_object(
      'total',    (SELECT COUNT(*) FROM job_requests),
      'publiees', (SELECT COUNT(*) FROM job_requests WHERE statut = 'publiee'),
      'en_cours', (SELECT COUNT(*) FROM job_requests WHERE statut = 'en_cours'),
      'terminees',(SELECT COUNT(*) FROM job_requests WHERE statut = 'terminee')
    ),
    'quotes', json_build_object(
      'total',     (SELECT COUNT(*) FROM quotes),
      'acceptes',  (SELECT COUNT(*) FROM quotes WHERE statut = 'accepte'),
      'refuses',   (SELECT COUNT(*) FROM quotes WHERE statut = 'refuse'),
      'en_attente',(SELECT COUNT(*) FROM quotes WHERE statut = 'en_attente')
    ),
    'reviews', json_build_object(
      'total',   (SELECT COUNT(*) FROM reviews),
      'verified',(SELECT COUNT(*) FROM reviews WHERE verified = true),
      'pending', (SELECT COUNT(*) FROM reviews WHERE verified = false)
    ),
    'artisans', json_build_object(
      'total',    (SELECT COUNT(*) FROM artisans),
      'pending',  (SELECT COUNT(*) FROM artisans WHERE statut_verification = 'en_attente'),
      'verified', (SELECT COUNT(*) FROM artisans WHERE statut_verification = 'verifie'),
      'rejected', (SELECT COUNT(*) FROM artisans WHERE statut_verification = 'rejete')
    )
  ) INTO result;

  RETURN result;
END;
$$;
