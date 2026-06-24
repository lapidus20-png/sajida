/*
  # Fix Database State Issues
  
  1. Create missing users profiles for auth users
  2. Fix mismatched user_type values
  3. Fix artisans.user_id links
*/

-- Insert missing users profiles
INSERT INTO public.users (id, user_type, email, telephone, adresse, ville)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'user_type', 'client')::text,
  au.email,
  COALESCE(au.raw_user_meta_data->>'telephone', ''),
  '',
  COALESCE(au.raw_user_meta_data->>'ville', '')
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Fix user_type mismatches
UPDATE public.users u
SET user_type = au.raw_user_meta_data->>'user_type'
FROM auth.users au
WHERE u.id = au.id
  AND au.raw_user_meta_data->>'user_type' IS NOT NULL
  AND u.user_type IS DISTINCT FROM au.raw_user_meta_data->>'user_type';

-- Update the statut constraint to include 'accepte' if missing
ALTER TABLE public.job_requests 
DROP CONSTRAINT IF EXISTS job_requests_statut_check;

ALTER TABLE public.job_requests 
ADD CONSTRAINT job_requests_statut_check 
CHECK (statut IN ('brouillon', 'publiee', 'en_negociation', 'attribuee', 'en_cours', 'terminee', 'annulee', 'accepte'));

-- Verify artisans.user_id links to valid users
-- Artisans with no user_id should have one created if they have an email
UPDATE public.artisans a
SET user_id = u.id
FROM public.users u
WHERE a.user_id IS NULL
  AND a.email IS NOT NULL 
  AND a.email != ''
  AND u.email = a.email;

-- Ensure admin user exists and has correct type
UPDATE public.users 
SET user_type = 'admin' 
WHERE email = 'admin@builderhub.com'
  AND user_type != 'admin';
