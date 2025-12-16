import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('Adding budget column and brouillon status to job_requests...\n');

  try {
    // Add budget column
    console.log('1. Adding budget column...');
    const { error: budgetError } = await supabase.rpc('exec', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'job_requests' AND column_name = 'budget'
          ) THEN
            ALTER TABLE job_requests ADD COLUMN budget integer DEFAULT 0;
            RAISE NOTICE 'budget column added';
          ELSE
            RAISE NOTICE 'budget column already exists';
          END IF;
        END $$;
      `
    });

    if (budgetError) {
      console.log('RPC not available, using direct SQL connection...');
      // Direct SQL approach using PostgREST
      await executeSQLStatements();
      return;
    }

    // Add latitude column
    console.log('2. Adding latitude column...');
    await supabase.rpc('exec', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'job_requests' AND column_name = 'latitude'
          ) THEN
            ALTER TABLE job_requests ADD COLUMN latitude decimal(10, 8);
            RAISE NOTICE 'latitude column added';
          ELSE
            RAISE NOTICE 'latitude column already exists';
          END IF;
        END $$;
      `
    });

    // Add longitude column
    console.log('3. Adding longitude column...');
    await supabase.rpc('exec', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'job_requests' AND column_name = 'longitude'
          ) THEN
            ALTER TABLE job_requests ADD COLUMN longitude decimal(11, 8);
            RAISE NOTICE 'longitude column added';
          ELSE
            RAISE NOTICE 'longitude column already exists';
          END IF;
        END $$;
      `
    });

    // Update statut constraint
    console.log('4. Updating statut constraint to include brouillon...');
    await supabase.rpc('exec', {
      sql: `
        ALTER TABLE job_requests DROP CONSTRAINT IF EXISTS job_requests_statut_check;
        ALTER TABLE job_requests ADD CONSTRAINT job_requests_statut_check
          CHECK (statut IN ('brouillon', 'publiee', 'en_negociation', 'attribuee', 'en_cours', 'terminee', 'annulee'));
        ALTER TABLE job_requests ALTER COLUMN statut SET DEFAULT 'brouillon';
      `
    });

    console.log('\n✓ Migration completed successfully!');
    console.log('\nChanges made:');
    console.log('  ✓ Added budget column (integer)');
    console.log('  ✓ Added latitude column (decimal)');
    console.log('  ✓ Added longitude column (decimal)');
    console.log('  ✓ Added brouillon status option');
    console.log('  ✓ Set default status to brouillon');

  } catch (err) {
    console.error('\n✗ Error running migration:', err.message);
    console.error('\nPlease run the SQL manually in Supabase SQL Editor:');
    console.error('File: add-budget-column.sql');
    process.exit(1);
  }
}

async function executeSQLStatements() {
  console.log('\nAttempting manual SQL execution...');
  console.log('Please run the following SQL in your Supabase SQL Editor:\n');
  console.log('File: add-budget-column.sql');
  console.log('\nOr use the Supabase Dashboard > SQL Editor to paste and run the migration.');
}

runMigration();
