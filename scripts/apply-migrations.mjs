import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(supabaseUrl, serviceKey);

console.log('\n=== Applying Database Migrations ===\n');

const criticalMigrations = [
  'supabase/migrations/20251029073237_create_tradesperson_schema.sql',
  'supabase/migrations/20251031100345_extend_schema_for_full_platform.sql',
];

async function applyMigration(filePath) {
  try {
    const fullPath = join(projectRoot, filePath);
    const sql = readFileSync(fullPath, 'utf-8');

    console.log(`\n📝 Applying: ${filePath.split('/').pop()}`);

    const { error } = await client.rpc('exec_sql', { sql_string: sql }).single();

    if (error) {
      // Try direct query if RPC doesn't work
      const lines = sql.split(';').filter(line => line.trim());

      for (const statement of lines) {
        if (statement.trim()) {
          const { error: stmtError } = await client.rpc('query', { query_text: statement + ';' });
          if (stmtError) {
            console.error(`   ❌ Error: ${stmtError.message}`);
          }
        }
      }
    } else {
      console.log('   ✅ Migration applied successfully');
    }
  } catch (error) {
    console.error(`   ❌ Failed to apply migration: ${error.message}`);
  }
}

async function main() {
  for (const migration of criticalMigrations) {
    await applyMigration(migration);
  }

  console.log('\n=== Verifying Database ===\n');

  // Check if users table exists
  const { data, error } = await client
    .from('users')
    .select('id')
    .limit(1);

  if (error) {
    console.log('❌ Users table not found or not accessible');
    console.log('   Error:', error.message);
    console.log('\n⚠️  Manual intervention may be required.');
    console.log('   Please run the SQL migrations directly in Supabase Dashboard:');
    console.log('   https://fldkqlardekarhibnyyx.supabase.co/project/_/sql');
  } else {
    console.log('✅ Database schema is ready!');
    console.log('   You can now register and login.');
  }
}

main();
