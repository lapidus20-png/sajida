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

if (!serviceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('\n🔧 RESTORING DATABASE\n');
console.log('This will recreate all tables and set up the schema.\n');

// Critical migrations in order
const migrations = [
  {
    name: 'Create Tradesperson Schema',
    file: 'supabase/migrations/20251029073237_create_tradesperson_schema.sql'
  },
  {
    name: 'Extend Schema for Full Platform',
    file: 'supabase/migrations/20251031100345_extend_schema_for_full_platform.sql'
  },
  {
    name: 'Comprehensive Auth Fix',
    file: 'supabase/migrations/20251206000000_comprehensive_auth_fix.sql'
  }
];

async function executeSQL(sql) {
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => {
      // Filter out comments and empty lines
      if (!s) return false;
      if (s.startsWith('/*') && s.endsWith('*/')) return false;
      if (s.startsWith('--')) return false;
      return s.length > 5; // Ignore very short statements
    });

  let executed = 0;
  let failed = 0;

  for (const statement of statements) {
    try {
      const { error } = await client.rpc('exec', { sql: statement + ';' });

      if (error) {
        // Try alternative method
        const chunks = statement.match(/.{1,1000}/g) || [statement];
        let success = false;

        for (const chunk of chunks) {
          const { error: chunkError } = await client.rpc('query', {
            query_text: chunk
          });

          if (!chunkError) {
            success = true;
            break;
          }
        }

        if (!success) {
          // Some errors are OK (already exists, etc)
          if (
            error.message.includes('already exists') ||
            error.message.includes('does not exist') ||
            error.message.includes('cannot drop')
          ) {
            executed++;
          } else {
            console.log(`   ⚠️  ${error.message.slice(0, 60)}...`);
            failed++;
          }
        } else {
          executed++;
        }
      } else {
        executed++;
      }
    } catch (err) {
      failed++;
    }
  }

  return { executed, failed };
}

async function restoreDatabase() {
  let totalExecuted = 0;
  let totalFailed = 0;

  for (const migration of migrations) {
    console.log(`\n📝 ${migration.name}`);

    try {
      const filePath = join(projectRoot, migration.file);
      const sql = readFileSync(filePath, 'utf-8');

      const { executed, failed } = await executeSQL(sql);
      totalExecuted += executed;
      totalFailed += failed;

      if (failed === 0) {
        console.log(`   ✅ Success (${executed} statements)`);
      } else {
        console.log(`   ⚠️  Completed with warnings (${executed} ok, ${failed} warnings)`);
      }
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      totalFailed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Total: ${totalExecuted} statements executed, ${totalFailed} warnings`);
  console.log('='.repeat(60));

  // Verify restoration
  console.log('\n🔍 Verifying restoration...\n');

  const tables = ['users', 'artisans', 'job_requests', 'quotes', 'messages'];
  let allGood = true;

  for (const table of tables) {
    const { error } = await client.from(table).select('id').limit(1);

    if (error) {
      console.log(`   ❌ ${table}: Not accessible`);
      allGood = false;
    } else {
      console.log(`   ✅ ${table}: Ready`);
    }
  }

  if (allGood) {
    console.log('\n🎉 DATABASE SUCCESSFULLY RESTORED!\n');
    console.log('You can now:');
    console.log('   1. Go to http://localhost:5173');
    console.log('   2. Click "Inscription" to create a new account');
    console.log('   3. Login with your credentials\n');
  } else {
    console.log('\n⚠️  Some tables are still missing.');
    console.log('\n📖 Manual restoration required:');
    console.log('   1. Go to: ' + supabaseUrl + '/project/_/sql');
    console.log('   2. Run each migration file manually in the SQL Editor');
    console.log('   3. Files to run (in order):');
    migrations.forEach(m => {
      console.log(`      - ${m.file}`);
    });
  }
}

restoreDatabase();
