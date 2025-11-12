/*
  # Fix Artisans Table RLS Policies
  
  1. Changes
    - Replace overly permissive policies with secure ones
    - Allow authenticated users to create their artisan profile
    - Artisans can only update their own profile
    - Everyone can view all artisans (public directory)
  
  2. Security
    - Only authenticated users can create artisan profiles
    - Artisans can only update their own profile (user_id = auth.uid())
    - Public read access for artisan directory
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Artisans peuvent mettre à jour leur profil" ON public.artisans;
DROP POLICY IF EXISTS "Tout le monde peut créer un profil artisan" ON public.artisans;
DROP POLICY IF EXISTS "Tout le monde peut voir les artisans" ON public.artisans;

-- Allow everyone (including anon) to view artisans (public directory)
CREATE POLICY "Public can view all artisans"
ON public.artisans
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to create their artisan profile
CREATE POLICY "Authenticated users can create artisan profile"
ON public.artisans
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow artisans to update only their own profile
CREATE POLICY "Artisans can update own profile"
ON public.artisans
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow artisans to delete their own profile
CREATE POLICY "Artisans can delete own profile"
ON public.artisans
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access on artisans"
ON public.artisans
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);