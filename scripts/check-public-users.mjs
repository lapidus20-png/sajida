#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function checkPublicUsers() {
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

  console.log('\n📋 Checking Public Users Table...\n');

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (users.length === 0) {
    console.log('⚠️  No users found in public.users table');
    console.log('\n📝 This means signups should work now!');
    console.log('Try signing up in the app as:');
    console.log('  1. Admin (create with: npm run create-admin)');
    console.log('  2. Client (sign up in app)');
    console.log('  3. Artisan (sign up in app)');
  } else {
    console.log(`Found ${users.length} user(s):\n`);
    users.forEach(user => {
      console.log(`📧 ${user.email}`);
      console.log(`   Type: ${user.user_type}`);
      console.log(`   ID: ${user.id.slice(0, 8)}...`);
      console.log(`   Phone: ${user.telephone || '(none)'}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log('');
    });

    const admin = users.find(u => u.user_type === 'admin');
    if (admin) {
      console.log(`✅ Admin account found: ${admin.email}`);
    } else {
      console.log('⚠️  No admin account found');
      console.log('   Run: npm run create-admin');
    }
  }

  console.log('\n🔍 Testing artisans table...');
  const { data: artisans, error: artisansError } = await supabase
    .from('artisans')
    .select('*');

  if (artisansError) {
    console.error('❌ Error checking artisans:', artisansError.message);
  } else {
    console.log(`✅ Found ${artisans.length} artisan(s)`);
  }

  console.log('\n✅ Check complete!\n');
}

checkPublicUsers().catch(console.error);
