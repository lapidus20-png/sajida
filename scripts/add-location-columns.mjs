import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function addLocationColumns() {
  console.log('Adding latitude and longitude columns to job_requests table...');

  try {
    // First check if columns exist
    const { data: checkData, error: checkError } = await supabase
      .from('job_requests')
      .select('latitude, longitude')
      .limit(1);

    if (!checkError) {
      console.log('✓ Location columns already exist');
      return;
    }

    // If we get an error about column not existing, that's expected
    if (checkError.message.includes('column') && checkError.message.includes('does not exist')) {
      console.log('Columns do not exist yet, they need to be added via SQL migration.');
      console.log('\nPlease run the following SQL in your Supabase SQL Editor:');
      console.log('\n--- Add location columns to job_requests ---');
      console.log('ALTER TABLE job_requests ADD COLUMN IF NOT EXISTS latitude decimal(10, 8);');
      console.log('ALTER TABLE job_requests ADD COLUMN IF NOT EXISTS longitude decimal(11, 8);');
      console.log('\n');
    } else {
      console.error('Unexpected error:', checkError);
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

addLocationColumns();
