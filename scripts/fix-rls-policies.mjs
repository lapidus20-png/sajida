import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

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

async function fixRLSPolicies() {
  console.log('Fixing RLS policies on users table...\n');

  // Re-enable RLS on users table
  console.log('1. Re-enabling RLS on users table...');
  const { error: rlsError } = await supabase.rpc('exec_sql', {
    query: 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;'
  });

  if (rlsError && !rlsError.message.includes('does not exist')) {
    console.error('Error enabling RLS:', rlsError);
  } else {
    console.log('   ✓ RLS enabled on users table');
  }

  // Drop existing policies
  console.log('\n2. Dropping existing policies...');
  const policiesToDrop = [
    'Users can read own profile',
    'Users can insert own profile',
    'Users can update own profile',
    'Allow authenticated users full access'
  ];

  for (const policy of policiesToDrop) {
    const { error } = await supabase.rpc('exec_sql', {
      query: `DROP POLICY IF EXISTS "${policy}" ON public.users;`
    });
    if (!error) {
      console.log(`   ✓ Dropped policy: ${policy}`);
    }
  }

  // Create new policies
  console.log('\n3. Creating new policies...');

  const policies = [
    {
      name: 'Users can read own profile',
      sql: `
        CREATE POLICY "Users can read own profile"
          ON public.users
          FOR SELECT
          TO authenticated
          USING (auth.uid() = id);
      `
    },
    {
      name: 'Users can insert own profile',
      sql: `
        CREATE POLICY "Users can insert own profile"
          ON public.users
          FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = id);
      `
    },
    {
      name: 'Users can update own profile',
      sql: `
        CREATE POLICY "Users can update own profile"
          ON public.users
          FOR UPDATE
          TO authenticated
          USING (auth.uid() = id)
          WITH CHECK (auth.uid() = id);
      `
    }
  ];

  for (const policy of policies) {
    const { error } = await supabase.rpc('exec_sql', {
      query: policy.sql
    });

    if (error) {
      console.error(`   ✗ Error creating policy "${policy.name}":`, error.message);
    } else {
      console.log(`   ✓ Created policy: ${policy.name}`);
    }
  }

  console.log('\n✅ RLS policies fixed successfully!');
}

fixRLSPolicies().catch(console.error);
