import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSavedJobs() {
  console.log('Checking saved_jobs table...\n');

  // Check if table exists
  const { data: tables, error: tableError } = await supabase
    .from('saved_jobs')
    .select('*')
    .limit(1);

  if (tableError) {
    console.error('❌ Error accessing saved_jobs table:', tableError.message);
    console.log('\nThe saved_jobs table might not exist or RLS policies are blocking access.');
    return;
  }

  console.log('✅ saved_jobs table exists and is accessible\n');

  // Check for saved jobs
  const { data: savedJobs, error: savedError } = await supabase
    .from('saved_jobs')
    .select('*');

  if (savedError) {
    console.error('❌ Error fetching saved jobs:', savedError.message);
    return;
  }

  console.log(`Found ${savedJobs?.length || 0} saved job(s):\n`);

  if (savedJobs && savedJobs.length > 0) {
    savedJobs.forEach((sj, index) => {
      console.log(`Saved Job ${index + 1}:`);
      console.log(`  ID: ${sj.id}`);
      console.log(`  Artisan ID: ${sj.artisan_id}`);
      console.log(`  Job Request ID: ${sj.job_request_id}`);
      console.log(`  Created: ${sj.created_at}`);
      console.log('');
    });
  } else {
    console.log('No saved jobs found in the database.');
  }

  // Check job_requests table for comparison
  const { data: jobs, error: jobsError } = await supabase
    .from('job_requests')
    .select('id, titre, statut')
    .limit(5);

  if (!jobsError && jobs) {
    console.log(`\nAvailable job requests (first 5):`);
    jobs.forEach((job, index) => {
      console.log(`  ${index + 1}. ${job.titre} (ID: ${job.id.slice(0, 8)}..., Status: ${job.statut})`);
    });
  }
}

checkSavedJobs();
