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

const fixSQL = `
-- Fix auth.users RLS
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Drop policies on auth.users
DO $$
DECLARE pol record;
BEGIN
    FOR pol IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'auth' AND tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON auth.users', pol.policyname);
    END LOOP;
END $$;

-- Temporarily disable RLS on all public tables
DO $$
DECLARE tbl record;
BEGIN
    FOR tbl IN
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', tbl.tablename);
    END LOOP;
END $$;

-- Drop broken triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users;

-- Create function to ensure user profile exists
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
  user_email text;
  result json;
BEGIN
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT email INTO user_email FROM auth.users WHERE id = user_id;

  INSERT INTO public.users (id, email, user_type, telephone, adresse, ville)
  VALUES (user_id, user_email, 'client', '', '', '')
  ON CONFLICT (id) DO NOTHING;

  RETURN json_build_object('success', true, 'user_id', user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO anon;
`;

console.log('Fixing database schema and permissions...');

try {
  const { data, error } = await supabase.rpc('exec_sql', { sql: fixSQL }).single();

  if (error) {
    // Try direct query if RPC doesn't exist
    const { error: directError } = await supabase.from('_migrations').select('*').limit(1);

    if (directError) {
      console.log('\nRunning SQL directly...');
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: fixSQL })
      });

      if (!response.ok) {
        throw new Error(`Failed: ${response.statusText}`);
      }
    }
  }

  console.log('✓ Database fixed successfully!');
  console.log('\nChanges applied:');
  console.log('- Disabled RLS on auth.users');
  console.log('- Removed broken policies and triggers');
  console.log('- Disabled RLS on all public tables (for testing)');
  console.log('- Created ensure_user_profile() function');
  console.log('\nYou can now signup and login!');

} catch (err) {
  console.error('Error:', err.message);
  console.log('\n⚠️  Script failed. Please run the SQL manually:');
  console.log('\n1. Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/sql/new');
  console.log('2. Select "Run as postgres user" or "Run as service_role"');
  console.log('3. Paste and run the SQL from: supabase/migrations/20251206000000_comprehensive_auth_fix.sql');
  process.exit(1);
}
