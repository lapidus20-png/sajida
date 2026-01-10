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
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
      const lines = sql.split(';').filter(line => line.trim());
      for (const line of lines) {
        if (line.trim()) {
          const { error: lineError } = await supabase.from('_migrations').insert({ query: line });
          if (lineError) {
            const { error: execError } = await supabase.rpc('exec', { sql: line });
            if (execError) throw execError;
          }
        }
      }
    });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }

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
