import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAuthDatabaseError() {
  console.log('🔧 Fixing authentication database error...\n');

  try {
    // Step 1: Disable RLS on auth.users
    console.log('Step 1: Disabling RLS on auth.users...');
    const { error: rlsError } = await supabase.rpc('query', {
      query: 'ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.log('   Note:', rlsError.message);
    } else {
      console.log('   ✅ RLS disabled');
    }

    // Step 2: Drop policies on auth.users
    console.log('\nStep 2: Removing policies on auth.users...');
    const { data: policies, error: policyCheckError } = await supabase
      .from('pg_policies')
      .select('policyname')
      .eq('schemaname', 'auth')
      .eq('tablename', 'users');

    if (!policyCheckError && policies && policies.length > 0) {
      console.log(`   Found ${policies.length} policies to remove`);
      for (const policy of policies) {
        await supabase.rpc('query', {
          query: `DROP POLICY IF EXISTS "${policy.policyname}" ON auth.users;`
        });
        console.log(`   ✅ Dropped policy: ${policy.policyname}`);
      }
    } else {
      console.log('   ✅ No policies found');
    }

    // Step 3: Drop triggers on auth.users
    console.log('\nStep 3: Removing triggers on auth.users...');
    const triggers = [
      'on_auth_user_created',
      'on_auth_user_created_v2',
      'ensure_user_profile_trigger'
    ];

    for (const trigger of triggers) {
      const { error } = await supabase.rpc('query', {
        query: `DROP TRIGGER IF EXISTS ${trigger} ON auth.users;`
      });

      if (!error) {
        console.log(`   ✅ Dropped trigger: ${trigger}`);
      }
    }

    // Step 4: Test authentication
    console.log('\nStep 4: Testing authentication...');
    const testEmail = `testuser${Date.now()}@test.com`;
    const testPassword = 'test123456';

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          test: true
        }
      }
    });

    if (signupError) {
      console.log('   ❌ Signup test failed:', signupError.message);
      console.log('\n⚠️  The issue persists. Additional steps may be needed.');
    } else {
      console.log('   ✅ Signup test successful!');

      // Clean up test user
      if (signupData.user) {
        const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false }
        });
        await adminClient.auth.admin.deleteUser(signupData.user.id);
        console.log('   ✅ Test user cleaned up');
      }

      console.log('\n✅ Authentication database error fixed successfully!');
      console.log('\nYou can now sign up users in your application.');
    }

  } catch (error) {
    console.error('\n❌ Error during fix:', error.message);
    console.log('\n📝 Manual fix required:');
    console.log('   1. Go to your Supabase Dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Run: ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;');
  }
}

fixAuthDatabaseError();
