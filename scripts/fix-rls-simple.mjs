import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(query, description) {
  console.log(`\n${description}...`);
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });

  if (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }

  console.log(`✅ Success`);
  return true;
}

async function fixDatabase() {
  console.log('=================================');
  console.log('Fixing Database RLS Issues');
  console.log('=================================');

  // Step 1: Disable RLS on auth.users
  await executeSQL(
    `ALTER TABLE IF EXISTS auth.users DISABLE ROW LEVEL SECURITY;`,
    'Step 1: Disabling RLS on auth.users'
  );

  // Step 2: Drop all policies from auth.users
  await executeSQL(
    `
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
    `,
    'Step 2: Dropping all policies from auth.users'
  );

  // Step 3: Enable RLS on public.users
  await executeSQL(
    `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`,
    'Step 3: Enabling RLS on public.users'
  );

  // Step 4: Drop old policies
  await executeSQL(
    `
    DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can read all user types for admin check" ON public.users;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
    `,
    'Step 4: Dropping old policies from public.users'
  );

  // Step 5: Create simple SELECT policy
  await executeSQL(
    `
    CREATE POLICY "authenticated_users_select_all"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);
    `,
    'Step 5: Creating SELECT policy'
  );

  // Step 6: Create INSERT policy
  await executeSQL(
    `
    CREATE POLICY "authenticated_users_insert_own"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);
    `,
    'Step 6: Creating INSERT policy'
  );

  // Step 7: Create UPDATE policy
  await executeSQL(
    `
    CREATE POLICY "authenticated_users_update_own"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
    `,
    'Step 7: Creating UPDATE policy'
  );

  // Step 8: Verify
  console.log('\n=================================');
  console.log('Verifying Configuration');
  console.log('=================================');

  const { data: policies, error: policiesError } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('schemaname', 'public')
    .eq('tablename', 'users');

  if (!policiesError) {
    console.log(`\n✅ Public.users has ${policies?.length || 0} policies`);
    policies?.forEach(p => {
      console.log(`   - ${p.policyname} (${p.cmd})`);
    });
  }

  console.log('\n=================================');
  console.log('Database fix completed!');
  console.log('Please try logging in again.');
  console.log('=================================\n');
}

fixDatabase().catch(console.error);
