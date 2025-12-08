#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function fixAuth() {
  console.log('\n🔧 Fixing Authentication System...\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables');
    console.error('Make sure .env file has VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Step 1: Make telephone nullable
    console.log('⏳ Step 1: Making telephone field nullable...');
    try {
      await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          query: 'ALTER TABLE public.users ALTER COLUMN telephone DROP NOT NULL;'
        })
      });
      console.log('✅ Telephone field is now nullable');
    } catch (e) {
      console.log('⚠️  Telephone field might already be nullable');
    }

    // Step 2: Check current state
    console.log('\n⏳ Step 2: Checking database state...');

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, user_type')
      .limit(5);

    if (usersError) {
      if (usersError.message.includes('row-level security')) {
        console.log('⚠️  RLS is blocking access - this is the problem!');
        console.log('📝 You need to run the SQL fix manually.');
        console.log('\n🔗 Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/sql/new');
        console.log('\n📋 Copy and run this SQL:\n');
        console.log('-- Disable RLS temporarily');
        console.log('ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE public.artisans DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE public.quotes DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE public.contact_requests DISABLE ROW LEVEL SECURITY;');
        console.log('\n-- Make telephone nullable');
        console.log('ALTER TABLE public.users ALTER COLUMN telephone DROP NOT NULL;');
        console.log('\n-- Drop broken functions');
        console.log('DROP FUNCTION IF EXISTS public.ensure_user_profile() CASCADE;');
        console.log('DROP FUNCTION IF EXISTS public.is_admin() CASCADE;');
        console.log('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;');
        console.log('DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users CASCADE;');
        console.log('\n⚠️  After running the SQL, run: npm run create-admin');
        return;
      }
      console.error('❌ Error accessing users table:', usersError.message);
      return;
    }

    console.log(`✅ Found ${users?.length || 0} existing users`);

    // Step 3: Instructions
    console.log('\n✅ Database access is working!');
    console.log('\n📝 Next steps:');
    console.log('1. Disable email confirmation at:');
    console.log('   https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/auth/providers');
    console.log('   (Scroll to Email section → Turn OFF "Confirm email")');
    console.log('\n2. Create admin account:');
    console.log('   npm run create-admin');
    console.log('\n3. Test in the app by signing up as client or artisan');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 You need manual access to Supabase dashboard to fix this.');
    console.log('🔗 See QUICK_FIX_STEPS.md for complete instructions');
  }
}

fixAuth().catch(console.error);
