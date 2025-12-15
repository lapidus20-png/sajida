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

async function checkArtisanData() {
  console.log('Checking artisan data...\n');

  // Get the Électricien artisan
  const { data: artisan, error: artisanError } = await supabase
    .from('artisans')
    .select('id, user_id, nom, prenom, metier')
    .eq('nom', 'ramadan')
    .maybeSingle();

  if (artisanError || !artisan) {
    console.error('Error or no artisan found:', artisanError);
    return;
  }

  console.log('Artisan:', artisan.nom, artisan.prenom);
  console.log('Artisan ID:', artisan.id);
  console.log('User ID:', artisan.user_id);
  console.log('Metier:', artisan.metier);
  console.log('\n' + '='.repeat(60) + '\n');

  // Check for quotes by this artisan
  const { data: quotes, error: quotesError } = await supabase
    .from('quotes')
    .select('*')
    .eq('artisan_id', artisan.id);

  if (quotesError) {
    console.error('Error fetching quotes:', quotesError);
  } else {
    console.log(`Quotes: ${quotes.length} found`);
    quotes.forEach(quote => {
      console.log(`  - Quote ID: ${quote.id}`);
      console.log(`    Job Request ID: ${quote.job_request_id}`);
      console.log(`    Amount: ${quote.montant_total}`);
      console.log(`    Status: ${quote.statut}\n`);
    });
  }

  console.log('='.repeat(60) + '\n');

  // Check for saved jobs
  const { data: savedJobs, error: savedError } = await supabase
    .from('artisan_saved_jobs')
    .select('*')
    .eq('artisan_id', artisan.id);

  if (savedError) {
    console.error('Error fetching saved jobs:', savedError);
  } else {
    console.log(`Saved Jobs: ${savedJobs.length} found`);
    savedJobs.forEach(saved => {
      console.log(`  - Job ID: ${saved.job_request_id}`);
      console.log(`    Saved at: ${saved.created_at}\n`);
    });
  }

  console.log('='.repeat(60) + '\n');

  // Check if the artisan_saved_jobs table exists
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .ilike('table_name', '%saved%');

  if (!tablesError) {
    console.log('Tables with "saved" in name:', tables?.map(t => t.table_name).join(', ') || 'none');
  }
}

checkArtisanData().catch(console.error);
