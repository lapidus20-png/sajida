-- ================================================
-- STORAGE POLICIES FOR BUILDERHUB
-- ================================================
-- Run this SQL in Supabase Dashboard > SQL Editor:
-- https://fldkqlardekarhibnyyx.supabase.co/project/_/sql/new
--
-- The storage buckets are already created. This SQL will apply
-- the access policies for all 4 buckets.
-- ================================================

-- ================================================
-- BUCKET: avatars (Public)
-- ================================================

-- Policy 1: Public read for avatars
-- Operation: SELECT
-- Target: public
CREATE POLICY IF NOT EXISTS "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 2: Users can upload own avatar
-- Operation: INSERT
-- Target: authenticated
CREATE POLICY IF NOT EXISTS "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update own avatar
-- Operation: UPDATE
-- Target: authenticated
CREATE POLICY IF NOT EXISTS "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete own avatar
-- Operation: DELETE
-- Target: authenticated
CREATE POLICY IF NOT EXISTS "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ================================================
-- BUCKET: portfolios (Public)
-- ================================================

-- Policy 1: Public read for portfolios
CREATE POLICY IF NOT EXISTS "Public read portfolios"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolios');

-- Policy 2: Users can upload to portfolio
CREATE POLICY IF NOT EXISTS "Users can upload to portfolio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update portfolio
CREATE POLICY IF NOT EXISTS "Users can update portfolio"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete from portfolio
CREATE POLICY IF NOT EXISTS "Users can delete from portfolio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ================================================
-- BUCKET: documents (Private)
-- ================================================

-- Policy 1: Users can view own documents (PRIVATE)
CREATE POLICY IF NOT EXISTS "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Users can upload own documents
CREATE POLICY IF NOT EXISTS "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update own documents
CREATE POLICY IF NOT EXISTS "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete own documents
CREATE POLICY IF NOT EXISTS "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ================================================
-- BUCKET: project-photos (Semi-public)
-- ================================================

-- Policy 1: Contract parties can view project photos
CREATE POLICY IF NOT EXISTS "Contract parties can view project photos"
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

-- Policy 2: Contract parties can upload project photos
CREATE POLICY IF NOT EXISTS "Contract parties can upload project photos"
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

-- Policy 3: Contract parties can update project photos
CREATE POLICY IF NOT EXISTS "Contract parties can update project photos"
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

-- Policy 4: Contract parties can delete project photos
CREATE POLICY IF NOT EXISTS "Contract parties can delete project photos"
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
-- END OF POLICIES
-- ================================================
