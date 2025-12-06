import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUsersRLS() {
  console.log('🔧 Fixing public.users RLS policies...\n');

  const sql = `
    -- Enable RLS on public.users
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

    -- Drop all existing policies
    DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
    DROP POLICY IF EXISTS "authenticated_users_select_all" ON public.users;
    DROP POLICY IF EXISTS "authenticated_users_insert_own" ON public.users;
    DROP POLICY IF EXISTS "authenticated_users_update_own" ON public.users;

    -- CREATE: Allow all authenticated users to view all profiles
    CREATE POLICY "authenticated_users_select_all"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);

    -- INSERT: Allow authenticated users to insert their own profile
    CREATE POLICY "authenticated_users_insert_own"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

    -- UPDATE: Allow users to update their own profile
    CREATE POLICY "authenticated_users_update_own"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If the exec_sql function doesn't exist, try direct query
      console.log('Trying alternative approach...\n');

      // Execute each statement separately
      const statements = [
        'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY',
        'DROP POLICY IF EXISTS "Users can read own profile" ON public.users',
        'DROP POLICY IF EXISTS "Users can insert own profile" ON public.users',
        'DROP POLICY IF EXISTS "Users can update own profile" ON public.users',
        'DROP POLICY IF EXISTS "authenticated_users_select_all" ON public.users',
        'DROP POLICY IF EXISTS "authenticated_users_insert_own" ON public.users',
        'DROP POLICY IF EXISTS "authenticated_users_update_own" ON public.users',
        `CREATE POLICY "authenticated_users_select_all" ON public.users FOR SELECT TO authenticated USING (true)`,
        `CREATE POLICY "authenticated_users_insert_own" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id)`,
        `CREATE POLICY "authenticated_users_update_own" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`
      ];

      for (const stmt of statements) {
        const result = await supabase.rpc('exec', { sql: stmt });
        if (result.error) {
          console.error(`❌ Error executing: ${stmt}`);
          console.error(`   ${result.error.message}\n`);
        } else {
          console.log(`✅ Executed: ${stmt.substring(0, 60)}...`);
        }
      }
    } else {
      console.log('✅ Successfully updated RLS policies!\n');
    }

    // Verify the policies were created
    console.log('\n📋 Verifying policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd')
      .eq('schemaname', 'public')
      .eq('tablename', 'users');

    if (policiesError) {
      console.log('Could not verify policies (this is OK if you\'re not using Postgres extensions)');
    } else if (policies && policies.length > 0) {
      console.log('\nCurrent policies on public.users:');
      policies.forEach(p => console.log(`  - ${p.policyname} (${p.cmd})`));
    }

    console.log('\n✅ Done! Try logging in to your app now.');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📝 You may need to run this SQL manually in Supabase Dashboard > SQL Editor:');
    console.log(sql);
    process.exit(1);
  }
}

fixUsersRLS();
