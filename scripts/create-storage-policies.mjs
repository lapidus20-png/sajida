import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createStoragePolicies() {
  console.log('Creating storage policies...\n');

  const policiesSQL = `
-- AVATARS POLICIES
CREATE POLICY IF NOT EXISTS "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- PORTFOLIOS POLICIES
CREATE POLICY IF NOT EXISTS "Public read portfolios"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolios');

CREATE POLICY IF NOT EXISTS "Users can upload to portfolio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can update portfolio"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete from portfolio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- DOCUMENTS POLICIES
CREATE POLICY IF NOT EXISTS "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- PROJECT-PHOTOS POLICIES
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
  `;

  console.log('\nStorage policies need to be applied via Supabase Dashboard.\n');
  console.log('Steps:');
  console.log('1. Go to: https://fldkqlardekarhibnyyx.supabase.co/project/_/sql/new');
  console.log('2. Copy the SQL from: STORAGE_SQL_POLICIES.sql');
  console.log('3. Paste and run in SQL Editor\n');
  console.log('Or copy this SQL:\n');
  console.log('─'.repeat(60));
  console.log(policiesSQL);
  console.log('─'.repeat(60));
  console.log('\n✓ Buckets are ready! Just apply the policies above.\n');
}

createStoragePolicies().catch(console.error);
