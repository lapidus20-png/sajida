#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function diagnose() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const anonClient = createClient(supabaseUrl, supabaseAnonKey);

  console.log('\n🔍 Diagnosing Login Issue...\n');

  console.log('Step 1: Check auth.users via Admin API');
  try {
    const { data: authUsers, error } = await adminClient.auth.admin.listUsers();
    if (error) {
      console.error('❌ Cannot list auth users:', error.message);
    } else {
      console.log(`✅ Found ${authUsers.users.length} auth users:`);
      authUsers.users.forEach(u => {
        console.log(`   ${u.email} - Confirmed: ${!!u.email_confirmed_at}`);
      });
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  }

  console.log('\nStep 2: Check public.users table (with service role)');
  try {
    const { data: publicUsers, error } = await adminClient
      .from('users')
      .select('id, email, user_type');

    if (error) {
      console.error('❌ Error:', error.message);
      console.log('💡 RLS might be blocking even service role!');
    } else {
      console.log(`✅ Found ${publicUsers.length} user profiles:`);
      publicUsers.forEach(u => {
        console.log(`   ${u.email} - Type: ${u.user_type}`);
      });
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  }

  console.log('\nStep 3: Check if anon key can access public.users');
  try {
    const { data, error } = await anonClient
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Anon CANNOT access users table:', error.message);
      console.log('💡 THIS IS THE PROBLEM! RLS is blocking access.');
    } else {
      console.log('✅ Anon can access users table');
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  }

  console.log('\n📋 Recommendation:');
  console.log('Run this SQL in Supabase dashboard to fix:');
  console.log('');
  console.log('ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;');
  console.log('');
  console.log('Dashboard URL: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/sql/new');
}

diagnose().catch(console.error);
