import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n=== Login Diagnosis ===\n');

// Create clients
const anonClient = createClient(supabaseUrl, supabaseKey);
const serviceClient = createClient(supabaseUrl, serviceKey);

async function diagnose() {
  try {
    // Check if users table exists and has data
    console.log('1. Checking users table...');
    const { data: users, error: usersError } = await serviceClient
      .from('users')
      .select('id, email, user_type, role')
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
    } else {
      console.log(`✅ Found ${users.length} users in database`);
      if (users.length > 0) {
        console.log('Sample users:', users.map(u => ({ email: u.email, type: u.user_type, role: u.role })));
      }
    }

    // Check auth.users
    console.log('\n2. Checking auth.users table...');
    const { data: authUsers, error: authError } = await serviceClient.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
    } else {
      console.log(`✅ Found ${authUsers.users.length} auth users`);
      if (authUsers.users.length > 0) {
        console.log('Sample auth users:', authUsers.users.slice(0, 5).map(u => ({
          email: u.email,
          confirmed: u.email_confirmed_at ? 'Yes' : 'No',
          created: u.created_at
        })));
      }
    }

    // Check RLS policies on users table
    console.log('\n3. Checking RLS policies on users table...');
    const { data: rlsStatus, error: rlsError } = await serviceClient.rpc('pg_catalog.pg_tables')
      .select('*')
      .eq('tablename', 'users');

    // Try to test login with a sample user
    if (users && users.length > 0) {
      console.log('\n4. Testing if we can read users table with anon client...');
      const { data: anonTest, error: anonError } = await anonClient
        .from('users')
        .select('id')
        .limit(1);

      if (anonError) {
        console.error('❌ Anon client cannot read users:', anonError.message);
        console.log('\nThis might be the problem - RLS policies may be blocking access');
      } else {
        console.log('✅ Anon client can read users table');
      }
    }

    // Suggest creating a test user
    console.log('\n5. Recommendations:');
    if (!users || users.length === 0) {
      console.log('❌ No users found. You need to create a user account first.');
      console.log('   Try registering a new account through the UI.');
    } else {
      console.log('✅ Users exist in database');
      console.log('\nTo test login, try these credentials:');
      console.log(`   Email: ${users[0].email}`);
      console.log('   Password: (the password you set during registration)');
    }

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

diagnose();
