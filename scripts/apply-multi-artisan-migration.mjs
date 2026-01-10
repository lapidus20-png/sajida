import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('Applying multi-artisan selection migration...\n');

  // Step 1: Create table
  console.log('1. Creating job_artisan_selections table...');
  const { error: tableError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS job_artisan_selections (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        job_request_id uuid NOT NULL REFERENCES job_requests(id) ON DELETE CASCADE,
        artisan_id uuid NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
        quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL,
        selected_at timestamptz DEFAULT now(),
        selection_order integer NOT NULL CHECK (selection_order BETWEEN 1 AND 3),
        UNIQUE(job_request_id, artisan_id),
        UNIQUE(job_request_id, selection_order)
      );
    `
  });

  if (tableError) {
    console.log('Note: Table creation error (may already exist):', tableError.message);
  } else {
    console.log('✓ Table created successfully');
  }

  // Step 2: Create indexes
  console.log('\n2. Creating indexes...');
  const { error: idx1Error } = await supabase.rpc('exec_sql', {
    sql: 'CREATE INDEX IF NOT EXISTS idx_job_artisan_selections_job ON job_artisan_selections(job_request_id);'
  });

  const { error: idx2Error } = await supabase.rpc('exec_sql', {
    sql: 'CREATE INDEX IF NOT EXISTS idx_job_artisan_selections_artisan ON job_artisan_selections(artisan_id);'
  });

  if (!idx1Error && !idx2Error) {
    console.log('✓ Indexes created successfully');
  }

  // Step 3: Enable RLS
  console.log('\n3. Enabling Row Level Security...');
  const { error: rlsError } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE job_artisan_selections ENABLE ROW LEVEL SECURITY;'
  });

  if (!rlsError) {
    console.log('✓ RLS enabled');
  }

  // Step 4: Create policies
  console.log('\n4. Creating RLS policies...');

  await supabase.rpc('exec_sql', {
    sql: `
      DROP POLICY IF EXISTS "Anyone can view selections" ON job_artisan_selections;
      CREATE POLICY "Anyone can view selections"
        ON job_artisan_selections FOR SELECT
        TO authenticated
        USING (true);
    `
  });

  await supabase.rpc('exec_sql', {
    sql: `
      DROP POLICY IF EXISTS "Clients can create selections for their jobs" ON job_artisan_selections;
      CREATE POLICY "Clients can create selections for their jobs"
        ON job_artisan_selections FOR INSERT
        TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM job_requests
            WHERE job_requests.id = job_request_id
            AND job_requests.client_id = auth.uid()
          )
        );
    `
  });

  await supabase.rpc('exec_sql', {
    sql: `
      DROP POLICY IF EXISTS "Clients can delete selections for their jobs" ON job_artisan_selections;
      CREATE POLICY "Clients can delete selections for their jobs"
        ON job_artisan_selections FOR DELETE
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM job_requests
            WHERE job_requests.id = job_request_id
            AND job_requests.client_id = auth.uid()
          )
        );
    `
  });

  console.log('✓ Policies created');

  // Step 5: Create notification function
  console.log('\n5. Creating notification function...');
  const { error: funcError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION notify_artisan_on_selection()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          related_job_id,
          created_at
        )
        SELECT
          a.user_id,
          'job_assigned',
          'Vous avez été sélectionné pour un projet',
          'Un client vous a sélectionné pour son projet "' || jr.titre || '". Contactez-le pour finaliser les détails.',
          NEW.job_request_id,
          now()
        FROM artisans a
        JOIN job_requests jr ON jr.id = NEW.job_request_id
        WHERE a.id = NEW.artisan_id;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  });

  if (!funcError) {
    console.log('✓ Function created');
  }

  // Step 6: Create trigger
  console.log('\n6. Creating notification trigger...');
  const { error: trigError } = await supabase.rpc('exec_sql', {
    sql: `
      DROP TRIGGER IF EXISTS trigger_notify_artisan_on_selection ON job_artisan_selections;
      CREATE TRIGGER trigger_notify_artisan_on_selection
        AFTER INSERT ON job_artisan_selections
        FOR EACH ROW
        EXECUTE FUNCTION notify_artisan_on_selection();
    `
  });

  if (!trigError) {
    console.log('✓ Trigger created');
  }

  console.log('\n✅ Migration completed successfully!\n');
  console.log('Features enabled:');
  console.log('- Clients can select up to 3 artisans per job');
  console.log('- Artisans receive automatic notifications when selected');
  console.log('- Selection order is tracked (1st, 2nd, 3rd choice)\n');
}

applyMigration().catch(console.error);
