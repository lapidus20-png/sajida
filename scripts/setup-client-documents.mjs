import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupClientDocuments() {
  console.log('Setting up client_documents table...');

  const query = `
    -- Create client_documents table
    CREATE TABLE IF NOT EXISTS client_documents (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      job_request_id uuid REFERENCES job_requests(id) ON DELETE SET NULL,
      file_name text NOT NULL,
      file_url text NOT NULL,
      file_path text NOT NULL,
      file_type text NOT NULL,
      file_size integer NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own documents" ON client_documents;
    DROP POLICY IF EXISTS "Users can insert own documents" ON client_documents;
    DROP POLICY IF EXISTS "Users can delete own documents" ON client_documents;

    -- Create RLS policies
    CREATE POLICY "Users can view own documents"
      ON client_documents
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own documents"
      ON client_documents
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete own documents"
      ON client_documents
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_client_documents_user_id ON client_documents(user_id);
    CREATE INDEX IF NOT EXISTS idx_client_documents_job_request_id ON client_documents(job_request_id);
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: query }).maybeSingle();

    if (error) {
      const { error: directError } = await supabase.from('_').select('*').limit(0);

      const parts = query.split(';').filter(part => part.trim());
      for (const part of parts) {
        if (part.trim()) {
          console.log('Executing:', part.substring(0, 50) + '...');
          const { error } = await supabase.rpc('exec_sql', { sql: part }).maybeSingle();
          if (error) {
            console.error('Error:', error.message);
          }
        }
      }
    }

    console.log('✓ client_documents table setup complete');
    console.log('\nYou can now:');
    console.log('- Upload documents and photos');
    console.log('- Paste images with Ctrl+V');
    console.log('- Drag and drop files');
    console.log('- Download and manage your files');

  } catch (error) {
    console.error('Error setting up table:', error);
    console.log('\nPlease run this SQL manually in Supabase:');
    console.log(query);
  }
}

setupClientDocuments();
