/*
  # Documentation des Storage Policies

  Ce fichier documente les policies RLS nécessaires pour les buckets storage.
  Les buckets doivent être créés manuellement dans le dashboard Supabase.

  ## Buckets à créer:

  1. avatars (public, 2MB, image/jpeg,image/png,image/webp)
  2. portfolios (public, 5MB, image/jpeg,image/png,image/webp)
  3. documents (private, 10MB, application/pdf,image/jpeg,image/png)
  4. project-photos (private, 5MB, image/jpeg,image/png,image/webp)

  ## Policies SQL à appliquer dans le dashboard:

  ### Pour 'avatars':
  
  SELECT Policy:
    bucket_id = 'avatars'
  
  INSERT Policy:
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  
  UPDATE Policy:
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  
  DELETE Policy:
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]

  ### Pour 'portfolios':
  (Mêmes policies que avatars)

  ### Pour 'documents':
  
  SELECT Policy:
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  
  INSERT/UPDATE/DELETE Policy:
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]

  ### Pour 'project-photos':
  
  SELECT Policy:
    bucket_id = 'project-photos' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM contracts
        WHERE (client_id = auth.uid() OR artisan_id = auth.uid())
        AND id::text = (storage.foldername(name))[1]
      )
    )
  
  INSERT/UPDATE/DELETE Policy:
    bucket_id = 'project-photos' AND
    EXISTS (
      SELECT 1 FROM contracts
      WHERE (client_id = auth.uid() OR artisan_id = auth.uid())
      AND id::text = (storage.foldername(name))[1]
    )

  Note: Ces policies ne peuvent pas être créées via migration SQL.
  Elles doivent être créées manuellement dans:
  Dashboard > Storage > [Bucket] > Policies > New Policy
*/

-- Cette migration est documentaire uniquement
-- Les buckets et policies doivent être créés manuellement

SELECT 1 as storage_policies_documented;
