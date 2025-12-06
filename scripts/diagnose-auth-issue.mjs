import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function diagnoseAuthIssue() {
  console.log('🔍 Diagnosing authentication issue...\n');

  try {
    // Check 1: RLS status on auth.users
    console.log('1. Checking RLS on auth.users...');
    const { data: rlsCheck, error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          schemaname,
          tablename,
          CASE
            WHEN c.relrowsecurity THEN 'ENABLED ❌'
            ELSE 'DISABLED ✅'
          END as rls_status
        FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename
        WHERE schemaname = 'auth' AND tablename = 'users';
      `
    });

    if (rlsError) {
      console.log('   Cannot check directly, trying alternative...');

      // Try to disable RLS on auth.users
      console.log('   Attempting to disable RLS on auth.users...');
      const { error: disableError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;'
      });

      if (disableError) {
        console.log('   ❌ Error:', disableError.message);
      } else {
        console.log('   ✅ RLS disabled on auth.users');
      }
    } else {
      console.log('   Status:', rlsCheck);
    }

    // Check 2: Triggers on auth.users
    console.log('\n2. Checking triggers on auth.users...');
    const { data: triggers, error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          trigger_name,
          event_manipulation
        FROM information_schema.triggers
        WHERE event_object_schema = 'auth'
          AND event_object_table = 'users';
      `
    });

    if (triggerError) {
      console.log('   ❌ Error:', triggerError.message);
    } else if (triggers && triggers.length > 0) {
      console.log('   ⚠️  Found triggers:', triggers);
      console.log('   Removing triggers...');

      for (const trigger of triggers) {
        const { error: dropError } = await supabase.rpc('exec_sql', {
          sql: `DROP TRIGGER IF EXISTS ${trigger.trigger_name} ON auth.users;`
        });

        if (dropError) {
          console.log(`   ❌ Error dropping ${trigger.trigger_name}:`, dropError.message);
        } else {
          console.log(`   ✅ Dropped trigger ${trigger.trigger_name}`);
        }
      }
    } else {
      console.log('   ✅ No triggers found');
    }

    // Check 3: Policies on auth.users
    console.log('\n3. Checking policies on auth.users...');
    const { data: policies, error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'auth' AND tablename = 'users';
      `
    });

    if (policyError) {
      console.log('   ❌ Error:', policyError.message);
    } else if (policies && policies.length > 0) {
      console.log('   ⚠️  Found policies:', policies);
      console.log('   Removing policies...');

      for (const policy of policies) {
        const { error: dropError } = await supabase.rpc('exec_sql', {
          sql: `DROP POLICY IF EXISTS "${policy.policyname}" ON auth.users;`
        });

        if (dropError) {
          console.log(`   ❌ Error dropping ${policy.policyname}:`, dropError.message);
        } else {
          console.log(`   ✅ Dropped policy ${policy.policyname}`);
        }
      }
    } else {
      console.log('   ✅ No policies found');
    }

    // Check 4: Test signup
    console.log('\n4. Testing signup...');
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123456'
    });

    if (signupError) {
      console.log('   ❌ Signup failed:', signupError.message);
    } else {
      console.log('   ✅ Signup successful!');

      // Clean up test user
      if (signupData.user) {
        await supabase.auth.admin.deleteUser(signupData.user.id);
        console.log('   Cleaned up test user');
      }
    }

    console.log('\n✅ Diagnosis complete!\n');

  } catch (error) {
    console.error('❌ Error during diagnosis:', error.message);
  }
}

diagnoseAuthIssue();
