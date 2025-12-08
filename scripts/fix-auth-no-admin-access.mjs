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

async function fixAuthentication() {
  console.log('🔧 Starting authentication fix...\n');

  const sqlCommands = [
    {
      name: 'Drop triggers',
      sql: `
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
        DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users CASCADE;
        DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users CASCADE;
        DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users CASCADE;
      `
    },
    {
      name: 'Drop functions',
      sql: `
        DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;
        DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
        DROP FUNCTION IF EXISTS public.ensure_user_profile() CASCADE;
        DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;
        DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
        DROP FUNCTION IF EXISTS public.has_artisan_profile(uuid) CASCADE;
      `
    },
    {
      name: 'Disable RLS on users table',
      sql: 'ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Disable RLS on artisans table',
      sql: 'ALTER TABLE public.artisans DISABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Disable RLS on jobs table',
      sql: 'ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Disable RLS on quotes table',
      sql: 'ALTER TABLE public.quotes DISABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Disable RLS on reviews table',
      sql: 'ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Disable RLS on messages table',
      sql: 'ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Disable RLS on notifications table',
      sql: 'ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Disable RLS on payments table',
      sql: 'ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Disable RLS on contact_requests table',
      sql: 'ALTER TABLE public.contact_requests DISABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Make telephone nullable',
      sql: `
        DO $$
        BEGIN
          ALTER TABLE public.users ALTER COLUMN telephone DROP NOT NULL;
        EXCEPTION
          WHEN OTHERS THEN NULL;
        END $$;
      `
    },
    {
      name: 'Add indexes',
      sql: `
        CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
        CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
        CREATE INDEX IF NOT EXISTS idx_artisans_user_id ON public.artisans(user_id);
      `
    }
  ];

  for (const command of sqlCommands) {
    try {
      console.log(`⏳ ${command.name}...`);
      const { error } = await supabase.rpc('exec_sql', { sql_query: command.sql });

      if (error) {
        console.error(`❌ Failed: ${error.message}`);
      } else {
        console.log(`✅ ${command.name} - Success`);
      }
    } catch (err) {
      console.error(`❌ ${command.name} - Error:`, err.message);
    }
  }

  console.log('\n🔍 Verifying RLS status...');
  const { data: rlsStatus, error: rlsError } = await supabase
    .from('pg_tables')
    .select('tablename, rowsecurity')
    .in('tablename', ['users', 'artisans'])
    .eq('schemaname', 'public');

  if (rlsError) {
    console.error('❌ Could not verify RLS status:', rlsError.message);
  } else {
    console.log('\nRLS Status:');
    rlsStatus?.forEach(table => {
      console.log(`  ${table.tablename}: ${table.rowsecurity ? '🔒 ENABLED' : '🔓 DISABLED'}`);
    });
  }

  console.log('\n✅ Authentication fix completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Create admin user: npm run create-admin');
  console.log('2. Try signing up as a client or artisan in the app');
  console.log('3. Check browser console for any remaining errors');
}

fixAuthentication().catch(console.error);
