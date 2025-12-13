import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTable() {
  console.log('Verifying client_documents table...\n');

  try {
    const { data, error } = await supabase
      .from('client_documents')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Table does NOT exist');
        console.log('\nPlease run this SQL manually in your Supabase SQL Editor:');
        console.log('https://supabase.com/dashboard/project/_/sql/new\n');
        console.log('Copy the contents of: setup-client-documents.sql');
        return false;
      } else {
        console.log('❌ Error:', error.message);
        return false;
      }
    }

    console.log('✓ Table exists and is accessible!');
    console.log('\nYour document upload feature is ready to use:');
    console.log('1. Login as a client');
    console.log('2. Go to the "Mes Documents" tab');
    console.log('3. Upload files by:');
    console.log('   - Clicking "Choisir des fichiers"');
    console.log('   - Dragging and dropping files');
    console.log('   - Pressing Ctrl+V to paste images');
    return true;

  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

verifyTable();
