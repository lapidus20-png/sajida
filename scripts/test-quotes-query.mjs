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

async function testQuotesQuery() {
  console.log('Testing quotes query...\n');

  // Get the artisan
  const { data: artisan } = await supabase
    .from('artisans')
    .select('id, nom, prenom')
    .eq('nom', 'ramadan')
    .maybeSingle();

  if (!artisan) {
    console.log('Artisan not found');
    return;
  }

  console.log('Testing for artisan:', artisan.nom, artisan.prenom);
  console.log('Artisan ID:', artisan.id);
  console.log('\n' + '='.repeat(60) + '\n');

  // Test the new query with correct column names
  const { data: quotes, error } = await supabase
    .from('quotes')
    .select('id, job_request_id, artisan_id, montant_total, description_travaux, delai_execution, statut, created_at')
    .eq('artisan_id', artisan.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching quotes:', error);
    return;
  }

  console.log(`✓ Found ${quotes.length} quote(s):\n`);

  quotes.forEach((quote, idx) => {
    console.log(`Quote ${idx + 1}:`);
    console.log(`  ID: ${quote.id}`);
    console.log(`  Job Request ID: ${quote.job_request_id}`);
    console.log(`  Montant Total: ${quote.montant_total} FCFA`);
    console.log(`  Délai: ${quote.delai_execution} jours`);
    console.log(`  Statut: ${quote.statut}`);
    console.log(`  Description: ${quote.description_travaux.substring(0, 60)}...`);
    console.log('');
  });

  if (quotes.length === 0) {
    console.log('❌ No quotes found - this is the issue!');
  } else {
    console.log(`✅ Quotes query is working correctly!`);
  }
}

testQuotesQuery().catch(console.error);
