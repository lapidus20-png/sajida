import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('\n🔍 INVESTIGATING DATABASE STATUS\n');
console.log('Database URL:', supabaseUrl);
console.log('Checking what happened...\n');

async function investigate() {
  try {
    // Check what tables exist
    console.log('1️⃣ Checking existing tables...');
    const { data: tables, error: tablesError } = await client
      .rpc('get_tables');

    if (tablesError) {
      // Alternative method
      const { data: pgTables, error: pgError } = await client
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (pgError) {
        console.log('   ⚠️  Cannot query tables directly');
        console.log('   Trying to access specific tables...\n');

        // Try each expected table
        const expectedTables = ['users', 'artisans', 'job_requests', 'quotes', 'messages'];

        for (const table of expectedTables) {
          const { data, error } = await client
            .from(table)
            .select('*')
            .limit(1);

          if (error) {
            console.log(`   ❌ ${table}: ${error.message}`);
          } else {
            console.log(`   ✅ ${table}: EXISTS`);
          }
        }
      } else {
        console.log('   Tables found:', pgTables.map(t => t.table_name));
      }
    }

    // Check auth users
    console.log('\n2️⃣ Checking auth.users...');
    const { data: authUsers, error: authError } = await client.auth.admin.listUsers();

    if (authError) {
      console.log('   ❌ Cannot access auth users:', authError.message);
    } else {
      console.log(`   📊 Total auth users: ${authUsers.users.length}`);
      if (authUsers.users.length > 0) {
        console.log('   Users:', authUsers.users.map(u => ({
          email: u.email,
          created: new Date(u.created_at).toLocaleDateString()
        })));
      }
    }

    // Check public.users
    console.log('\n3️⃣ Checking public.users table...');
    const { data: publicUsers, error: usersError } = await client
      .from('users')
      .select('id, email, user_type, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (usersError) {
      console.log('   ❌ Cannot access users table:', usersError.message);
      console.log('\n   🚨 ROOT CAUSE: Users table does not exist or is inaccessible');
    } else {
      console.log(`   ✅ Users table exists with ${publicUsers.length} records`);
      if (publicUsers.length > 0) {
        console.log('   Recent users:', publicUsers.slice(0, 3).map(u => ({
          email: u.email,
          type: u.user_type,
          created: new Date(u.created_at).toLocaleDateString()
        })));
      }
    }

    // Check artisans
    console.log('\n4️⃣ Checking artisans table...');
    const { data: artisans, error: artisansError } = await client
      .from('artisans')
      .select('id, nom, prenom, metier')
      .limit(5);

    if (artisansError) {
      console.log('   ❌ Cannot access artisans table:', artisansError.message);
    } else {
      console.log(`   ✅ Artisans table exists with ${artisans.length} records`);
    }

    // Check for migrations table
    console.log('\n5️⃣ Checking migration history...');
    const { data: migrations, error: migrationsError } = await client
      .from('supabase_migrations')
      .select('*')
      .order('version', { ascending: false })
      .limit(5);

    if (migrationsError) {
      console.log('   ⚠️  No migration history found');
      console.log('   This means migrations were never applied');
    } else {
      console.log(`   ✅ Found ${migrations.length} migrations`);
      migrations.forEach(m => {
        console.log(`   - ${m.version}: ${m.name || 'unnamed'}`);
      });
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 DIAGNOSIS SUMMARY');
    console.log('='.repeat(60));

    if (usersError && usersError.message.includes('does not exist')) {
      console.log('\n❌ PROBLEM: Database schema was never created or was deleted');
      console.log('\n💡 SOLUTION:');
      console.log('   Your database needs to be set up. This can happen if:');
      console.log('   - This is a new Supabase project');
      console.log('   - The project was reset');
      console.log('   - The database was cleared');
      console.log('\n   Run this command to set up the database:');
      console.log('   node scripts/setup-database-completely.mjs');
      console.log('\n   Or follow manual steps in SETUP_DATABASE.md');
    } else if (publicUsers && publicUsers.length === 0 && authUsers && authUsers.users.length === 0) {
      console.log('\n⚠️  PROBLEM: Database exists but no users');
      console.log('\n💡 SOLUTION: Register a new account at http://localhost:5173');
    } else {
      console.log('\n✅ Database appears to be set up correctly');
      console.log('   If you still cannot login, try:');
      console.log('   1. Clear browser cache and cookies');
      console.log('   2. Use incognito/private mode');
      console.log('   3. Check browser console for errors');
    }

  } catch (error) {
    console.error('\n❌ Investigation failed:', error.message);
  }
}

investigate();
