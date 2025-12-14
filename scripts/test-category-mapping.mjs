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

const METIER_TO_CATEGORY_MAP = {
  'Électricien': ['Électricité'],
  'Plombier': ['Plomberie'],
  'Maçon': ['Maçonnerie'],
  'Menuisier': ['Menuiserie'],
  'Menuisier métallique': ['Menuiserie'],
  'Peintre': ['Peinture'],
  'Carreleur': ['Carrelage'],
  'Couvreur': ['Couverture'],
  'Soudeur': ['Soudure'],
  'Mécanicien': ['Mécanique'],
  'Électromécanicien': ['Électricité', 'Mécanique'],
  'Couturier': ['Couture'],
  'Couturière': ['Couture'],
  'couturiere': ['Couture'],
};

function getJobCategoriesForMetiers(metiers) {
  const categories = new Set();

  metiers.forEach(metier => {
    const mappedCategories = METIER_TO_CATEGORY_MAP[metier];
    if (mappedCategories) {
      mappedCategories.forEach(cat => categories.add(cat));
    } else {
      categories.add(metier);
    }
  });

  return Array.from(categories);
}

async function testCategoryMapping() {
  console.log('Testing category mapping logic...\n');

  // Get an Électricien artisan
  const { data: artisan, error: artisanError } = await supabase
    .from('artisans')
    .select('id, nom, prenom, metier')
    .eq('nom', 'ramadan')
    .maybeSingle();

  if (artisanError) {
    console.error('Error fetching artisan:', artisanError);
    return;
  }

  if (!artisan) {
    console.log('No artisan found with nom = ramadan');
    return;
  }

  console.log('Artisan found:', artisan.nom, artisan.prenom);
  console.log('Raw metier value:', JSON.stringify(artisan.metier));
  console.log('Type:', typeof artisan.metier);

  // Parse metier like the frontend does
  const parseMetier = (metier) => {
    if (!metier) return [];
    if (Array.isArray(metier)) return metier;
    if (typeof metier === 'string') {
      if (metier.startsWith('[') || metier.startsWith('"')) {
        try {
          const parsed = JSON.parse(metier);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          return [metier];
        }
      }
      return [metier];
    }
    return [];
  };

  const artisanMetiers = parseMetier(artisan.metier);

  console.log('\nParsed metiers:', artisanMetiers);

  // Map to categories
  const jobCategories = getJobCategoriesForMetiers(artisanMetiers);
  console.log('Mapped categories:', jobCategories);

  // Try to query jobs with these categories
  console.log('\n' + '='.repeat(60));
  console.log('Querying jobs with categories:', jobCategories);
  console.log('='.repeat(60) + '\n');

  const jobsQuery = supabase
    .from('job_requests')
    .select('id, titre, description, categorie, statut')
    .eq('statut', 'publiee')
    .order('created_at', { ascending: false });

  if (jobCategories.length > 0) {
    jobsQuery.in('categorie', jobCategories);
  }

  const { data: jobs, error: jobsError } = await jobsQuery;

  if (jobsError) {
    console.error('Error fetching jobs:', jobsError);
    return;
  }

  console.log(`Found ${jobs.length} jobs for this artisan:\n`);
  jobs.forEach(job => {
    console.log(`  ✓ ${job.titre}`);
    console.log(`    Category: ${job.categorie}`);
    console.log(`    Status: ${job.statut}\n`);
  });

  if (jobs.length === 0) {
    console.log('  ❌ NO JOBS FOUND - THIS IS THE ISSUE!\n');
    console.log('Available job categories:');
    const { data: allJobs } = await supabase
      .from('job_requests')
      .select('categorie')
      .eq('statut', 'publiee');

    const categories = [...new Set(allJobs.map(j => j.categorie))];
    categories.forEach(cat => console.log(`    - "${cat}"`));
  }
}

testCategoryMapping().catch(console.error);
