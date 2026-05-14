/*
  # Fix Broken Schema Causing "Database error querying schema"

  Root causes identified:
  1. update_artisan_note_moyenne() references non-existent column 'nombre_avis' on artisans
     → This breaks PostgREST schema introspection which Supabase auth relies on
  2. Duplicate/conflicting RLS policies on contracts, messages, quotes, job_requests
     → Old policies use artisan_id = auth.uid() which is wrong (artisan_id refs artisans.id)
  3. can_view_contact_info() uses status 'completed'/'paid' but schema uses 'complete'/'paye'

  Fixes:
  - Add missing nombre_avis column to artisans
  - Fix update_artisan_note_moyenne function
  - Remove all duplicate/conflicting policies
  - Fix can_view_contact_info function
*/

-- 1. Add missing nombre_avis column that the trigger references
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artisans' AND column_name = 'nombre_avis'
  ) THEN
    ALTER TABLE artisans ADD COLUMN nombre_avis integer DEFAULT 0;
  END IF;
END $$;

-- 2. Fix the broken trigger function
CREATE OR REPLACE FUNCTION public.update_artisan_note_moyenne()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.artisans SET
    note_moyenne = COALESCE((SELECT AVG(note) FROM public.avis WHERE avis.artisan_id = NEW.artisan_id), 0),
    nombre_avis = (SELECT COUNT(*) FROM public.avis WHERE avis.artisan_id = NEW.artisan_id)
  WHERE id = NEW.artisan_id;
  RETURN NEW;
END;
$$;

-- 3. Fix update_artisan_average_rating (used by reviews table trigger)
CREATE OR REPLACE FUNCTION public.update_artisan_average_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.artisans SET
    note_moyenne = COALESCE((SELECT AVG(note) FROM public.avis WHERE avis.artisan_id = NEW.artisan_id), 0)
  WHERE id = NEW.artisan_id;
  RETURN NEW;
END;
$$;

-- 4. Fix can_view_contact_info (uses wrong status values)
CREATE OR REPLACE FUNCTION public.can_view_contact_info(artisan_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.contracts c
    WHERE c.artisan_id = artisan_uuid
      AND c.client_id = user_uuid
      AND c.statut IN ('en_cours', 'termine')
  );
END;
$$;

-- 5. Remove duplicate/conflicting policies on contracts
DROP POLICY IF EXISTS "Clients et artisans voient leurs contrats" ON public.contracts;
DROP POLICY IF EXISTS "Seul le système crée les contrats" ON public.contracts;

-- 6. Remove duplicate/conflicting policies on messages
DROP POLICY IF EXISTS "Les utilisateurs peuvent envoyer des messages" ON public.messages;
DROP POLICY IF EXISTS "Les utilisateurs voient leurs messages" ON public.messages;

-- 7. Remove duplicate/conflicting policies on quotes
-- Old policies wrongly use artisan_id = auth.uid() (artisan_id is artisans.id, not user id)
DROP POLICY IF EXISTS "Les artisans et clients voient les devis pertinents" ON public.quotes;
DROP POLICY IF EXISTS "Les artisans peuvent créer des devis" ON public.quotes;
DROP POLICY IF EXISTS "Les artisans peuvent modifier leurs devis" ON public.quotes;

-- 8. Remove duplicate policies on job_requests
DROP POLICY IF EXISTS "Les clients peuvent créer des demandes" ON public.job_requests;
DROP POLICY IF EXISTS "Les clients peuvent mettre à jour leurs demandes" ON public.job_requests;
DROP POLICY IF EXISTS "Tout le monde peut voir les demandes publiées" ON public.job_requests;

-- 9. Ensure artisans can also view their own quotes via the correct policy
DROP POLICY IF EXISTS "Artisans can manage own quotes" ON public.quotes;
CREATE POLICY "Artisans can manage own quotes"
  ON public.quotes FOR ALL
  TO authenticated
  USING (artisan_id IN (SELECT id FROM artisans WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (artisan_id IN (SELECT id FROM artisans WHERE user_id = (SELECT auth.uid())));
