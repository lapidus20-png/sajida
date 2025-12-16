import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addBrouillonStatus() {
  console.log('🔧 Adding brouillon status to job_requests...\n');

  try {
    // First, drop the existing constraint
    console.log('⏳ Dropping existing constraint...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE job_requests DROP CONSTRAINT IF EXISTS job_requests_statut_check;'
    }).maybeSingle();

    if (dropError && !dropError.message.includes('does not exist')) {
      console.error('❌ Error dropping constraint:', dropError.message);
    } else {
      console.log('✅ Constraint dropped');
    }

    // Then add the new constraint
    console.log('⏳ Adding new constraint with brouillon status...');
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE job_requests ADD CONSTRAINT job_requests_statut_check CHECK (statut IN ('brouillon', 'publiee', 'en_negociation', 'attribuee', 'en_cours', 'terminee', 'annulee'));`
    }).maybeSingle();

    if (addError) {
      console.error('❌ Error adding constraint:', addError.message);

      // Try alternative approach using direct SQL
      console.log('⏳ Trying alternative approach...');
      const { error: altError, data } = await supabase
        .from('job_requests')
        .select('*')
        .limit(0);

      console.log('Database connection OK. Please run this SQL manually:');
      console.log('\nALTER TABLE job_requests DROP CONSTRAINT IF EXISTS job_requests_statut_check;');
      console.log('ALTER TABLE job_requests ADD CONSTRAINT job_requests_statut_check CHECK (statut IN (\'brouillon\', \'publiee\', \'en_negociation\', \'attribuee\', \'en_cours\', \'terminee\', \'annulee\'));\n');
      process.exit(1);
    }

    console.log('✅ Successfully added brouillon status to job_requests!');
    console.log('\nClients can now create draft job requests before publishing.\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\nPlease run this SQL manually in your Supabase SQL editor:');
    console.log('\nALTER TABLE job_requests DROP CONSTRAINT IF EXISTS job_requests_statut_check;');
    console.log('ALTER TABLE job_requests ADD CONSTRAINT job_requests_statut_check CHECK (statut IN (\'brouillon\', \'publiee\', \'en_negociation\', \'attribuee\', \'en_cours\', \'terminee\', \'annulee\'));\n');
    process.exit(1);
  }
}

addBrouillonStatus().catch(console.error);
