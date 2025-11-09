-- ================================================
-- STORAGE POLICIES FOR BUILDERHUB
-- ================================================
-- Ces policies doivent être créées manuellement dans le dashboard Supabase
-- après avoir créé les buckets.
--
-- IMPORTANT: Créer d'abord les buckets dans Storage > New bucket
-- Ensuite appliquer ces policies dans Storage > [Bucket] > Policies > New Policy

-- ================================================
-- BUCKET: avatars (Public)
-- ================================================

-- Policy 1: Public read for avatars
-- Operation: SELECT
-- Target: public
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 2: Users can upload own avatar
-- Operation: INSERT
-- Target: authenticated
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update own avatar
-- Operation: UPDATE
-- Target: authenticated
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete own avatar
-- Operation: DELETE
-- Target: authenticated
CREATE POLICY "Users can delete own avatar"
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
CREATE POLICY "Public read portfolios"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolios');

-- Policy 2: Users can upload to portfolio
CREATE POLICY "Users can upload to portfolio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update portfolio
CREATE POLICY "Users can update portfolio"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete from portfolio
CREATE POLICY "Users can delete from portfolio"
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
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Users can upload own documents
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update own documents
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete own documents
CREATE POLICY "Users can delete own documents"
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

-- Policy 2: Contract parties can upload project photos
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

-- Policy 3: Contract parties can update project photos
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

-- Policy 4: Contract parties can delete project photos
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
-- FIN DES POLICIES
-- ================================================

-- RAPPEL: Ces policies doivent être créées dans le dashboard Supabase
-- Elles ne peuvent pas être appliquées via migration SQL standard.
