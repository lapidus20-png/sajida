#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function checkUsers() {
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

  console.log('\n👥 Checking Users...\n');

  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Error listing auth users:', authError.message);
    return;
  }

  console.log('🔐 Auth Users:');
  authUsers.users.forEach(user => {
    console.log(`  - ${user.email} (ID: ${user.id.slice(0, 8)}...)`);
  });

  const { data: publicUsers, error: publicError } = await supabase
    .from('users')
    .select('*');

  if (publicError) {
    console.error('❌ Error listing public users:', publicError.message);
    return;
  }

  console.log('\n📋 Public Users Table:');
  if (publicUsers.length === 0) {
    console.log('  (empty)');
  } else {
    publicUsers.forEach(user => {
      console.log(`  - ${user.email} | Type: ${user.user_type} | Phone: ${user.telephone || 'null'}`);
    });
  }

  console.log('\n🔍 Finding admin@builderhub.com...');
  const adminAuth = authUsers.users.find(u => u.email === 'admin@builderhub.com');
  const adminPublic = publicUsers.find(u => u.email === 'admin@builderhub.com');

  if (adminAuth) {
    console.log('✅ Admin exists in auth.users');
    console.log(`   ID: ${adminAuth.id}`);
  } else {
    console.log('❌ Admin NOT found in auth.users');
  }

  if (adminPublic) {
    console.log('✅ Admin exists in public.users');
    console.log(`   Type: ${adminPublic.user_type}`);

    if (adminPublic.user_type !== 'admin') {
      console.log('\n⚠️  Fixing admin user type...');
      const { error: updateError } = await supabase
        .from('users')
        .update({ user_type: 'admin' })
        .eq('email', 'admin@builderhub.com');

      if (updateError) {
        console.error('❌ Error updating:', updateError.message);
      } else {
        console.log('✅ Admin user type fixed!');
      }
    }
  } else {
    console.log('❌ Admin NOT found in public.users');

    if (adminAuth) {
      console.log('\n⚠️  Adding admin to public.users...');
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: adminAuth.id,
          email: 'admin@builderhub.com',
          user_type: 'admin',
          telephone: null,
          adresse: null,
          ville: null
        });

      if (insertError) {
        console.error('❌ Error inserting:', insertError.message);
      } else {
        console.log('✅ Admin added to public.users!');
      }
    }
  }

  console.log('\n✅ Check complete!\n');
}

checkUsers().catch(console.error);
