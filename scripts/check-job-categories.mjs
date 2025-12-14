import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkData() {
  console.log('Checking job_requests and artisan metier data...\n');

  // Check job requests
  const { data: jobs, error: jobsError } = await supabase
    .from('job_requests')
    .select('id, titre, categorie, statut')
    .order('created_at', { ascending: false })
    .limit(20);

  if (jobsError) {
    console.error('Error fetching jobs:', jobsError);
  } else {
    console.log(`Found ${jobs.length} job requests:`);
    jobs.forEach(job => {
      console.log(`  - ${job.titre} | categorie: "${job.categorie}" | statut: ${job.statut}`);
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Check artisans
  const { data: artisans, error: artisansError } = await supabase
    .from('artisans')
    .select('id, nom, prenom, metier')
    .limit(10);

  if (artisansError) {
    console.error('Error fetching artisans:', artisansError);
  } else {
    console.log(`Found ${artisans.length} artisans:`);
    artisans.forEach(artisan => {
      console.log(`  - ${artisan.nom} ${artisan.prenom} | metier: ${JSON.stringify(artisan.metier)}`);
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Check for published jobs with specific categories
  const { data: publishedJobs, error: publishedError } = await supabase
    .from('job_requests')
    .select('id, titre, categorie, statut')
    .eq('statut', 'publiee');

  if (publishedError) {
    console.error('Error fetching published jobs:', publishedError);
  } else {
    console.log(`Found ${publishedJobs.length} PUBLISHED job requests:`);
    const categories = {};
    publishedJobs.forEach(job => {
      categories[job.categorie] = (categories[job.categorie] || 0) + 1;
    });
    console.log('\nCategories breakdown:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  - "${cat}": ${count} jobs`);
    });
  }
}

checkData().catch(console.error);
