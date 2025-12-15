import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSavedJobsTable() {
  console.log('Creating saved_jobs table...\n');

  const createTableSQL = `
    -- Create saved_jobs table if it doesn't exist
    CREATE TABLE IF NOT EXISTS saved_jobs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      artisan_id uuid NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
      job_request_id uuid NOT NULL REFERENCES job_requests(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      UNIQUE(artisan_id, job_request_id)
    );

    -- Create index for faster queries
    CREATE INDEX IF NOT EXISTS idx_saved_jobs_artisan_id ON saved_jobs(artisan_id);
    CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_request_id ON saved_jobs(job_request_id);

    -- Enable RLS
    ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if any
    DROP POLICY IF EXISTS "Artisans can view their saved jobs" ON saved_jobs;
    DROP POLICY IF EXISTS "Artisans can save jobs" ON saved_jobs;
    DROP POLICY IF EXISTS "Artisans can unsave jobs" ON saved_jobs;

    -- Create RLS policies
    CREATE POLICY "Artisans can view their saved jobs"
      ON saved_jobs FOR SELECT
      TO authenticated
      USING (
        artisan_id IN (
          SELECT id FROM artisans WHERE user_id = auth.uid()
        )
      );

    CREATE POLICY "Artisans can save jobs"
      ON saved_jobs FOR INSERT
      TO authenticated
      WITH CHECK (
        artisan_id IN (
          SELECT id FROM artisans WHERE user_id = auth.uid()
        )
      );

    CREATE POLICY "Artisans can unsave jobs"
      ON saved_jobs FOR DELETE
      TO authenticated
      USING (
        artisan_id IN (
          SELECT id FROM artisans WHERE user_id = auth.uid()
        )
      );
  `;

  const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

  if (error) {
    // If exec_sql doesn't exist, try direct execution
    const { error: directError } = await supabase
      .from('_sql')
      .insert({ query: createTableSQL });

    if (directError) {
      console.error('Error creating table. Trying alternative method...');

      // Execute via multiple queries
      const queries = createTableSQL.split(';').filter(q => q.trim());

      for (const query of queries) {
        if (query.trim()) {
          try {
            await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`
              },
              body: JSON.stringify({ query: query.trim() })
            });
          } catch (e) {
            console.log('Query execution note:', query.substring(0, 50) + '...');
          }
        }
      }

      console.log('\n✓ Saved jobs table creation attempted');
      console.log('\nPlease run this SQL in your Supabase SQL Editor:\n');
      console.log(createTableSQL);
      return;
    }
  }

  console.log('✓ Saved jobs table created successfully!');
}

createSavedJobsTable().catch(console.error);
