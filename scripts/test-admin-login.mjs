#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function testLogin() {
  console.log('\n🔐 Testing Admin Login\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('Found admin account: admin@builderhub.com');
  console.log('');

  const password = await question('Enter the password for admin@builderhub.com: ');

  if (!password) {
    console.log('❌ Password required');
    rl.close();
    return;
  }

  console.log('\n⏳ Attempting login...\n');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@builderhub.com',
    password: password
  });

  if (error) {
    console.error('❌ Login failed:', error.message);

    if (error.message.includes('Email not confirmed')) {
      console.log('\n💡 Solution:');
      console.log('Email confirmation is enabled in Supabase.');
      console.log('Ask your team member who has dashboard access to:');
      console.log('1. Go to: https://supabase.com/dashboard/project/fldkqlardekarhibnyyx/auth/providers');
      console.log('2. Scroll to "Email" section');
      console.log('3. Toggle OFF "Confirm email"');
      console.log('4. Click "Save"');
    } else if (error.message.includes('Invalid')) {
      console.log('\n💡 Wrong password or account doesn\'t exist');
      console.log('If you don\'t have the password, ask your team member who created it.');
    }
  } else {
    console.log('✅ Login successful!');
    console.log('\nUser Info:');
    console.log(`  Email: ${data.user.email}`);
    console.log(`  ID: ${data.user.id}`);
    console.log(`  Confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log('\n✅ You can use this account to log into the app!');
  }

  rl.close();
}

testLogin().catch(console.error);
