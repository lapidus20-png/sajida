#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function main() {
  console.log('\n🔐 Admin User Creation Script\n');
  console.log('This script will create an admin account for BuilderHub.\n');

  // Get Supabase credentials from environment
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error('❌ Error: VITE_SUPABASE_URL not found in environment variables');
    console.error('Please ensure your .env file is properly configured.');
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found');
    console.error('\nTo get your service role key:');
    console.error('1. Go to https://supabase.com/dashboard');
    console.error('2. Select your project');
    console.error('3. Go to Project Settings > API');
    console.error('4. Copy the "service_role" key (secret)');
    console.error('5. Add to your .env file: SUPABASE_SERVICE_ROLE_KEY=your_key_here\n');
    process.exit(1);
  }

  // Create Supabase client with service role
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Get admin email
    const email = await question('Enter admin email: ');
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      process.exit(1);
    }

    // Get admin password
    const password = await question('Enter admin password (min 6 characters): ');
    if (!password || password.length < 6) {
      console.error('❌ Password must be at least 6 characters');
      process.exit(1);
    }

    console.log('\n⏳ Creating admin account...\n');

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId;

    if (existingUser) {
      console.log(`✓ User ${email} already exists in auth`);
      userId = existingUser.id;
      
      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: password }
      );
      
      if (updateError) {
        console.error('⚠️  Could not update password:', updateError.message);
      } else {
        console.log('✓ Password updated');
      }
    } else {
      // Create new auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
      });

      if (authError) {
        console.error('❌ Error creating auth user:', authError.message);
        process.exit(1);
      }

      userId = authData.user.id;
      console.log('✓ Auth user created');
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile to admin
      const { error: updateError } = await supabase
        .from('users')
        .update({ user_type: 'admin' })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Error updating profile:', updateError.message);
        process.exit(1);
      }
      console.log('✓ Profile updated to admin');
    } else {
      // Create new profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          user_type: 'admin',
          telephone: '',
          adresse: '',
          ville: ''
        });

      if (profileError) {
        console.error('❌ Error creating profile:', profileError.message);
        process.exit(1);
      }
      console.log('✓ Admin profile created');
    }

    console.log('\n✅ SUCCESS! Admin account is ready.\n');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 User Type: admin\n');
    console.log('You can now log in at your application.\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
