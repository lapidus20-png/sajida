-- ================================================
-- STORAGE SETUP: Run this in Supabase SQL Editor
-- ================================================
-- 1. Go to: https://fldkqlardekarhibnyyx.supabase.co/project/_/sql/new
-- 2. Paste this entire SQL
-- 3. Click "Run"
-- ================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('portfolios', 'portfolios', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('project-photos', 'project-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- AVATARS BUCKET POLICIES (PUBLIC)
-- ================================================

CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ================================================
-- PORTFOLIOS BUCKET POLICIES (PUBLIC)
-- ================================================

CREATE POLICY "Public read portfolios"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolios');

CREATE POLICY "Users can upload to portfolio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update portfolio"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete from portfolio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ================================================
-- DOCUMENTS BUCKET POLICIES (PRIVATE)
-- ================================================

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ================================================
-- PROJECT-PHOTOS BUCKET POLICIES (SEMI-PUBLIC)
-- ================================================

CREATE POLICY "Contract parties can view project photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-photos' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    EXISTS (
      SELECT 1 FROM contracts
      WHERE (client_id = auth.uid() OR artisan_id = auth.uid())
      AND id::text = (storage.foldername(name))[1]
    )
  )
);

CREATE POLICY "Contract parties can upload project photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-photos' AND
  EXISTS (
    SELECT 1 FROM contracts
    WHERE (client_id = auth.uid() OR artisan_id = auth.uid())
    AND id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Contract parties can update project photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-photos' AND
  EXISTS (
    SELECT 1 FROM contracts
    WHERE (client_id = auth.uid() OR artisan_id = auth.uid())
    AND id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Contract parties can delete project photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-photos' AND
  EXISTS (
    SELECT 1 FROM contracts
    WHERE (client_id = auth.uid() OR artisan_id = auth.uid())
    AND id::text = (storage.foldername(name))[1]
  )
);

-- ================================================
-- DONE! Storage buckets and policies created.
-- ================================================