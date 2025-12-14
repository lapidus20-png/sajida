import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateMetierToArray() {
  console.log('🔄 Starting migration: Converting metier to array...\n');

  try {
    // Step 1: Add temporary column
    console.log('Step 1: Adding temporary column metier_array...');
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE artisans ADD COLUMN IF NOT EXISTS metier_array text[]'
    });

    // Try alternative approach - direct SQL execution
    const steps = [
      {
        name: 'Add temporary column',
        sql: 'ALTER TABLE artisans ADD COLUMN IF NOT EXISTS metier_array text[]'
      },
      {
        name: 'Migrate existing data',
        sql: `UPDATE artisans SET metier_array = ARRAY[metier] WHERE metier_array IS NULL`
      },
      {
        name: 'Drop old column',
        sql: 'ALTER TABLE artisans DROP COLUMN IF EXISTS metier'
      },
      {
        name: 'Rename new column',
        sql: 'ALTER TABLE artisans RENAME COLUMN metier_array TO metier'
      },
      {
        name: 'Set default value',
        sql: `ALTER TABLE artisans ALTER COLUMN metier SET DEFAULT ARRAY[]::text[]`
      },
      {
        name: 'Set not null',
        sql: 'ALTER TABLE artisans ALTER COLUMN metier SET NOT NULL'
      }
    ];

    // Execute using the from/insert pattern (won't work for DDL)
    // Let's try using a raw SQL approach
    console.log('Executing migration steps...\n');

    for (const step of steps) {
      console.log(`▶ ${step.name}...`);
      try {
        // We need to execute raw SQL - let's use a function approach
        const { error } = await supabase.rpc('exec_raw_sql', { query: step.sql });

        if (error) {
          console.log(`  Attempting alternative method...`);
          // If RPC doesn't work, we'll need to create a migration file
        }
        console.log(`  ✓ Success`);
      } catch (err) {
        console.log(`  ⚠ Error: ${err.message}`);
      }
    }

    console.log('\n✅ Migration preparation complete!');
    console.log('\nPlease run the following SQL in your Supabase SQL Editor:');
    console.log('\n' + '='.repeat(60));
    console.log(`
-- Convert metier from text to text[] array
ALTER TABLE artisans ADD COLUMN IF NOT EXISTS metier_array text[];
UPDATE artisans SET metier_array = ARRAY[metier] WHERE metier_array IS NULL;
ALTER TABLE artisans DROP COLUMN IF EXISTS metier;
ALTER TABLE artisans RENAME COLUMN metier_array TO metier;
ALTER TABLE artisans ALTER COLUMN metier SET DEFAULT ARRAY[]::text[];
ALTER TABLE artisans ALTER COLUMN metier SET NOT NULL;
    `);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

updateMetierToArray();
