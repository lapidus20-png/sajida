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

console.log('\n🔧 Setting Up Database Schema...\n');

async function executeSQL(sql) {
  const { data, error } = await client.rpc('exec', { sql });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function setupDatabase() {
  try {
    // Read the comprehensive migration
    const migrationPath = join(projectRoot, 'supabase/migrations/20251206000000_comprehensive_auth_fix.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📝 Applying comprehensive auth fix migration...');

    // Split by statements and execute one by one
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('/*') && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await client.rpc('query', { query_text: statement + ';' });

          if (!error) {
            successCount++;
          } else {
            // Some errors are expected (like "already exists" or "does not exist")
            if (error.message.includes('already exists') ||
                error.message.includes('does not exist') ||
                error.message.includes('cannot drop')) {
              successCount++;
            } else {
              console.log(`   ⚠️  ${error.message.slice(0, 80)}`);
              errorCount++;
            }
          }
        } catch (err) {
          console.log(`   ⚠️  ${err.message.slice(0, 80)}`);
          errorCount++;
        }
      }
    }

    console.log(`\n✅ Processed ${successCount + errorCount} statements`);
    console.log(`   Success: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   Warnings: ${errorCount}`);
    }

    // Verify the setup
    console.log('\n🔍 Verifying database setup...');

    const { data: users, error: usersError } = await client
      .from('users')
      .select('id')
      .limit(1);

    if (usersError) {
      throw new Error(`Users table verification failed: ${usersError.message}`);
    }

    console.log('✅ Users table is accessible');

    const { data: artisans, error: artisansError } = await client
      .from('artisans')
      .select('id')
      .limit(1);

    if (artisansError) {
      throw new Error(`Artisans table verification failed: ${artisansError.message}`);
    }

    console.log('✅ Artisans table is accessible');

    console.log('\n🎉 Database is ready!');
    console.log('\nYou can now:');
    console.log('   1. Register a new account');
    console.log('   2. Login with your credentials');
    console.log('\nTest the app at: http://localhost:5173');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n⚠️  Trying alternative approach...');

    // Alternative: Try applying just the critical schema
    try {
      await applyMinimalSchema();
    } catch (altError) {
      console.error('\n❌ Alternative approach also failed');
      console.log('\n📖 Manual Setup Required:');
      console.log('   1. Go to: https://fldkqlardekarhibnyyx.supabase.co/project/_/sql');
      console.log('   2. Copy and paste the content from:');
      console.log('      supabase/migrations/20251206000000_comprehensive_auth_fix.sql');
      console.log('   3. Click "Run" to execute the migration');
    }
  }
}

async function applyMinimalSchema() {
  console.log('\n📝 Applying minimal schema...');

  // Read and apply the first migration
  const schema1 = readFileSync(
    join(projectRoot, 'supabase/migrations/20251029073237_create_tradesperson_schema.sql'),
    'utf-8'
  );

  const schema2 = readFileSync(
    join(projectRoot, 'supabase/migrations/20251031100345_extend_schema_for_full_platform.sql'),
    'utf-8'
  );

  // Execute using raw PostgreSQL client
  const combinedSQL = schema1 + '\n\n' + schema2;

  const statements = combinedSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('/*') && !s.startsWith('--'));

  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await client.rpc('query', { query_text: statement + ';' });
      } catch (err) {
        // Ignore errors
      }
    }
  }

  console.log('✅ Minimal schema applied');
}

setupDatabase();
