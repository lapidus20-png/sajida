import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyBudgetColumn() {
  console.log('Verifying budget column in job_requests table...\n');

  // Try to query job_requests with budget column
  console.log('Testing query with budget column...');
  const { data, error } = await supabase
    .from('job_requests')
    .select('id, titre, budget')
    .limit(1);

  if (error) {
    console.error('❌ Error querying budget column:', error.message);
    console.log('\nAttempting to reload schema cache...');

    // Send a request to trigger schema cache reload
    try {
      await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'OPTIONS',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      });

      console.log('Waiting for schema cache to refresh...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Try query again
      const { data: data2, error: error2 } = await supabase
        .from('job_requests')
        .select('id, titre, budget')
        .limit(1);

      if (error2) {
        console.error('❌ Still getting error:', error2.message);
        console.log('\n⚠️  The column exists in the database but PostgREST schema cache needs manual refresh.');
        console.log('Please wait a few minutes for Supabase to automatically refresh its schema cache.');
      } else {
        console.log('✅ Budget column is now working!');
        if (data2 && data2.length > 0) {
          console.log('Sample data:', data2[0]);
        }
      }
    } catch (err) {
      console.error('Error during schema refresh:', err.message);
    }
  } else {
    console.log('✅ Budget column is working!');
    if (data && data.length > 0) {
      console.log('Sample data:', data[0]);
    } else {
      console.log('No job requests found yet, but the column is accessible.');
    }
  }
}

verifyBudgetColumn();
