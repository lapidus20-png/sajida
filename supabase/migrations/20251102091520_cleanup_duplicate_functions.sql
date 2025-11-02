/*
  # Cleanup Duplicate Functions

  1. Suppression des anciennes versions de fonctions
     - Supprime versions sans search_path fixe
     - Garde uniquement versions sécurisées

  2. Note sur "Unused Indexes"
     - 43 indexes apparaissent "unused" car BD dev est vide
     - Ces indexes sont ESSENTIELS en production
     - NE PAS les supprimer

  3. Note sur "Multiple Permissive Policies"
     - Design intentionnel pour reviews
     - Users voient leurs avis + avis vérifiés des autres
     - C'est le bon comportement de sécurité
*/

-- Supprimer anciennes versions de fonctions (sans search_path fixe)

-- calculate_distance avec numeric (ancienne version)
DROP FUNCTION IF EXISTS calculate_distance(numeric, numeric, numeric, numeric);

-- can_view_contact_info avec 3 params (ancienne version)
DROP FUNCTION IF EXISTS can_view_contact_info(uuid, uuid, uuid);

-- mask_phone avec 1 param (ancienne version)
DROP FUNCTION IF EXISTS mask_phone(text);

-- mask_email avec 1 param (ancienne version)
DROP FUNCTION IF EXISTS mask_email(text);

-- Vérification: toutes les fonctions doivent avoir search_path fixe
DO $$
DECLARE
  unsafe_count integer;
BEGIN
  SELECT COUNT(*) INTO unsafe_count
  FROM pg_proc p
  WHERE p.pronamespace = 'public'::regnamespace
  AND p.proname IN ('calculate_distance', 'can_view_contact_info', 'mask_phone', 'mask_email',
                     'update_artisan_average_rating', 'calculate_platform_fee', 
                     'update_updated_at_column', 'update_artisan_note_moyenne')
  AND (p.proconfig IS NULL OR NOT ('search_path=""' = ANY(p.proconfig)));
  
  IF unsafe_count > 0 THEN
    RAISE WARNING 'Il reste % fonctions sans search_path fixe', unsafe_count;
  ELSE
    RAISE NOTICE 'Toutes les fonctions sont sécurisées avec search_path fixe';
  END IF;
END $$;
