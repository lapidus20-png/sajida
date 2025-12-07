import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorage() {
  console.log('Setting up storage buckets and policies...\n');

  try {
    // Read and execute the SQL file
    const { readFile } = await import('fs/promises');
    const sql = await readFile('./setup-storage.sql', 'utf-8');

    console.log('Executing storage setup SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If the function doesn't exist, try running it directly
      console.log('Trying alternative method...');
      const { error: directError } = await supabase.from('_sql').insert({ query: sql });

      if (directError) {
        console.error('Error executing SQL:', directError);
        console.log('\n⚠️  Could not execute SQL automatically.');
        console.log('Please run the SQL manually:');
        console.log('1. Open: https://fldkqlardekarhibnyyx.supabase.co/project/_/sql/new');
        console.log('2. Copy the contents of setup-storage.sql');
        console.log('3. Paste and click "Run"\n');
        process.exit(1);
      }
    }

    console.log('✅ Storage setup complete!\n');
    console.log('Created buckets:');
    console.log('  - avatars (public)');
    console.log('  - portfolios (public)');
    console.log('  - documents (private)');
    console.log('  - project-photos (semi-public)\n');

  } catch (err) {
    console.error('Error:', err.message);
    console.log('\n⚠️  Could not execute SQL automatically.');
    console.log('Please run the SQL manually:');
    console.log('1. Open: https://fldkqlardekarhibnyyx.supabase.co/project/_/sql/new');
    console.log('2. Copy the contents of setup-storage.sql');
    console.log('3. Paste and click "Run"\n');
    process.exit(1);
  }
}

setupStorage();
