import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function forceAddBudgetColumn() {
  console.log('Force adding budget column to job_requests...\n');

  // Use raw SQL to add the column
  const queries = [
    // First, check and add budget column
    `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'job_requests'
        AND column_name = 'budget'
      ) THEN
        ALTER TABLE public.job_requests ADD COLUMN budget integer DEFAULT 0;
        RAISE NOTICE 'Column budget added to job_requests';
      ELSE
        RAISE NOTICE 'Column budget already exists';
      END IF;
    END $$;
    `,

    // Verify column was added
    `
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'job_requests'
    AND column_name = 'budget';
    `
  ];

  for (let i = 0; i < queries.length; i++) {
    console.log(`\nExecuting query ${i + 1}/${queries.length}...`);

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ query: queries[i] })
      });

      const result = await response.text();
      console.log('Response:', response.status, result.substring(0, 300));
    } catch (err) {
      console.log('Note:', err.message);
    }
  }

  console.log('\n\nWaiting 5 seconds for schema to propagate...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Test if we can now query the budget column
  console.log('\nTesting budget column access...');
  const { data, error } = await supabase
    .from('job_requests')
    .select('id, titre, budget')
    .limit(1);

  if (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Manual fix needed:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run this SQL:');
    console.log('   ALTER TABLE job_requests ADD COLUMN IF NOT EXISTS budget integer DEFAULT 0;');
    console.log('4. Then restart the PostgREST server or wait 5-10 minutes');
  } else {
    console.log('✅ Budget column is working!');
    console.log('Data:', data);
  }
}

forceAddBudgetColumn();
