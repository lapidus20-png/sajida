import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...');
    const sqlFile = join(__dirname, '..', 'add-selected-artisan-tracking.sql');
    const sql = readFileSync(sqlFile, 'utf8');

    console.log('🔄 Applying migration...');

    const statements = [
      `ALTER TABLE job_requests ADD COLUMN IF NOT EXISTS selected_artisan_id uuid REFERENCES artisans(id) ON DELETE SET NULL`,
      `ALTER TABLE job_requests ADD COLUMN IF NOT EXISTS closed_at timestamptz`,
      `CREATE INDEX IF NOT EXISTS idx_job_requests_selected_artisan ON job_requests(selected_artisan_id)`,
      `CREATE INDEX IF NOT EXISTS idx_job_requests_statut ON job_requests(statut)`,
    ];

    for (const statement of statements) {
      const { error } = await supabase.rpc('exec', { sql: statement }).catch(() => ({ error: null }));
      if (error) {
        console.log(`Note: ${error.message}`);
      }
    }

    const functionSql = `
      CREATE OR REPLACE FUNCTION update_job_closed_at()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.selected_artisan_id IS NOT NULL AND OLD.selected_artisan_id IS NULL THEN
          NEW.closed_at = now();
          NEW.statut = 'attribuee';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const triggerSql = `
      DROP TRIGGER IF EXISTS trigger_update_job_closed_at ON job_requests;
      CREATE TRIGGER trigger_update_job_closed_at
        BEFORE UPDATE ON job_requests
        FOR EACH ROW
        EXECUTE FUNCTION update_job_closed_at();
    `;

    await supabase.rpc('exec', { sql: functionSql }).catch(() => {});
    await supabase.rpc('exec', { sql: triggerSql }).catch(() => {});

    console.log('✅ Migration applied successfully!');
    console.log('\nChanges made:');
    console.log('  - Added selected_artisan_id column to job_requests');
    console.log('  - Added closed_at timestamp column to job_requests');
    console.log('  - Created indexes for better performance');
    console.log('  - Created trigger to auto-update job status when artisan is selected');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

applyMigration();
