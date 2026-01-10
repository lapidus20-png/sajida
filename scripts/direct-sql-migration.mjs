import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSql(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${error}`);
  }

  return response.json();
}

async function applyMigration() {
  console.log('Applying multi-artisan selection migration directly...\n');

  const statements = [
    {
      name: 'Create table',
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
    },
    {
      name: 'Create job_request_id index',
      sql: 'CREATE INDEX IF NOT EXISTS idx_job_artisan_selections_job ON job_artisan_selections(job_request_id);'
    },
    {
      name: 'Create artisan_id index',
      sql: 'CREATE INDEX IF NOT EXISTS idx_job_artisan_selections_artisan ON job_artisan_selections(artisan_id);'
    },
    {
      name: 'Enable RLS',
      sql: 'ALTER TABLE job_artisan_selections ENABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Drop old SELECT policy',
      sql: 'DROP POLICY IF EXISTS "Anyone can view selections" ON job_artisan_selections;'
    },
    {
      name: 'Create SELECT policy',
      sql: `
        CREATE POLICY "Anyone can view selections"
          ON job_artisan_selections FOR SELECT
          TO authenticated
          USING (true);
      `
    },
    {
      name: 'Drop old INSERT policy',
      sql: 'DROP POLICY IF EXISTS "Clients can create selections for their jobs" ON job_artisan_selections;'
    },
    {
      name: 'Create INSERT policy',
      sql: `
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
    },
    {
      name: 'Drop old DELETE policy',
      sql: 'DROP POLICY IF EXISTS "Clients can delete selections for their jobs" ON job_artisan_selections;'
    },
    {
      name: 'Create DELETE policy',
      sql: `
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
    },
    {
      name: 'Create notification function',
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
    },
    {
      name: 'Drop old trigger',
      sql: 'DROP TRIGGER IF EXISTS trigger_notify_artisan_on_selection ON job_artisan_selections;'
    },
    {
      name: 'Create notification trigger',
      sql: `
        CREATE TRIGGER trigger_notify_artisan_on_selection
          AFTER INSERT ON job_artisan_selections
          FOR EACH ROW
          EXECUTE FUNCTION notify_artisan_on_selection();
      `
    }
  ];

  for (const statement of statements) {
    try {
      console.log(`Executing: ${statement.name}...`);
      await executeSql(statement.sql);
      console.log(`✓ ${statement.name} completed`);
    } catch (error) {
      console.log(`⚠ ${statement.name}: ${error.message}`);
    }
  }

  console.log('\n✅ Migration process completed!\n');
  console.log('Features enabled:');
  console.log('- Clients can select up to 3 artisans per job');
  console.log('- Artisans receive automatic notifications when selected');
  console.log('- Selection order is tracked (1st, 2nd, 3rd choice)\n');
}

applyMigration().catch(console.error);
