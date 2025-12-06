import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAuthLogin() {
  console.log('Fixing authentication login issues...\n');

  try {
    // Step 1: Disable RLS on auth.users
    console.log('1. Disabling RLS on auth.users...');
    const { error: disableRlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE IF EXISTS auth.users DISABLE ROW LEVEL SECURITY;'
    });
    if (disableRlsError) {
      console.log('   Note: Could not disable RLS on auth.users (this is normal if you don\'t have permissions)');
    } else {
      console.log('   ✓ RLS disabled on auth.users');
    }

    // Step 2: Remove policies from auth.users
    console.log('\n2. Removing policies from auth.users...');
    const { error: dropAuthPoliciesError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        DECLARE
            pol record;
        BEGIN
            FOR pol IN
                SELECT policyname
                FROM pg_policies
                WHERE schemaname = 'auth' AND tablename = 'users'
            LOOP
                EXECUTE format('DROP POLICY IF EXISTS %I ON auth.users', pol.policyname);
            END LOOP;
        END $$;
      `
    });
    if (dropAuthPoliciesError) {
      console.log('   Note: Could not drop auth.users policies');
    } else {
      console.log('   ✓ Policies removed from auth.users');
    }

    // Step 3: Enable RLS on public.users
    console.log('\n3. Ensuring RLS is enabled on public.users...');
    const { error: enableRlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;'
    });
    if (enableRlsError) {
      console.error('   ✗ Error enabling RLS:', enableRlsError);
    } else {
      console.log('   ✓ RLS enabled on public.users');
    }

    // Step 4: Drop existing policies on public.users
    console.log('\n4. Dropping old policies on public.users...');
    const policiesToDrop = [
      'Users can read own profile',
      'Users can insert own profile',
      'Users can update own profile',
      'authenticated_users_select_all',
      'authenticated_users_insert_own',
      'authenticated_users_update_own'
    ];

    for (const policy of policiesToDrop) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policy}" ON public.users;`
      });
      if (!error) {
        console.log(`   ✓ Dropped policy: ${policy}`);
      }
    }

    // Step 5: Create new policies
    console.log('\n5. Creating new policies on public.users...');

    const { error: selectPolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "authenticated_users_select_all"
        ON public.users FOR SELECT TO authenticated USING (true);
      `
    });
    if (selectPolicyError) {
      console.error('   ✗ Error creating SELECT policy:', selectPolicyError);
    } else {
      console.log('   ✓ Created SELECT policy');
    }

    const { error: insertPolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "authenticated_users_insert_own"
        ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
      `
    });
    if (insertPolicyError) {
      console.error('   ✗ Error creating INSERT policy:', insertPolicyError);
    } else {
      console.log('   ✓ Created INSERT policy');
    }

    const { error: updatePolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "authenticated_users_update_own"
        ON public.users FOR UPDATE TO authenticated
        USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
      `
    });
    if (updatePolicyError) {
      console.error('   ✗ Error creating UPDATE policy:', updatePolicyError);
    } else {
      console.log('   ✓ Created UPDATE policy');
    }

    console.log('\n✅ Authentication login fix complete!');
    console.log('\nYou should now be able to log in to the application.');

  } catch (error) {
    console.error('\n❌ Error fixing authentication:', error);
    process.exit(1);
  }
}

fixAuthLogin();
