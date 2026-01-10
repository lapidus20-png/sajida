import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAppSettings() {
  try {
    console.log('Setting up app settings table...');

    const sqlFile = join(__dirname, '..', 'add-app-settings.sql');
    const sql = readFileSync(sqlFile, 'utf8');

    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql
    });

    if (error) {
      console.error('Error executing SQL:', error);

      console.log('\nAttempting direct table creation...');

      const { error: tableError } = await supabase
        .from('app_settings')
        .select('id')
        .limit(1);

      if (tableError && tableError.code === '42P01') {
        console.log('Table does not exist. Please run the SQL file manually in Supabase dashboard.');
        console.log('\nSQL file location: add-app-settings.sql');
        console.log('\nNavigate to: Supabase Dashboard > SQL Editor');
        console.log('Then paste the contents of add-app-settings.sql');
      } else if (!tableError) {
        console.log('✓ Table already exists');
      }
    } else {
      console.log('✓ App settings table created successfully');
    }

    const { data: settings, error: selectError } = await supabase
      .from('app_settings')
      .select('*')
      .in('setting_key', ['banking_account', 'platform_commission']);

    if (selectError) {
      console.error('Error checking settings:', selectError);
    } else {
      console.log(`\n✓ Found ${settings?.length || 0} settings configured`);
      if (settings) {
        settings.forEach(setting => {
          console.log(`  - ${setting.setting_key}: ${setting.description}`);
        });
      }
    }

    console.log('\n✓ Setup complete!');
    console.log('\nYou can now configure the banking account in the Admin Dashboard > Settings tab');

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

setupAppSettings();
