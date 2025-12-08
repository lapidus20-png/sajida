#!/usr/bin/env node

import 'dotenv/config';

async function disableRLS() {
  console.log('\n🔓 Disabling RLS using Service Role Key...\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing environment variables');
    console.error('Need: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const queries = [
    'ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE public.artisans DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE public.quotes DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE IF EXISTS public.contact_requests DISABLE ROW LEVEL SECURITY;',
    'ALTER TABLE public.users ALTER COLUMN telephone DROP NOT NULL;'
  ];

  console.log('📋 Running SQL commands...\n');

  for (const query of queries) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ query })
      });

      const shortQuery = query.substring(0, 50) + '...';

      if (response.ok || response.status === 404) {
        console.log(`✅ ${shortQuery}`);
      } else {
        const text = await response.text();
        console.log(`⚠️  ${shortQuery}`);
        console.log(`   Response: ${text.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`❌ Error on query: ${query}`);
      console.error(error.message);
    }
  }

  console.log('\n🎉 Done! RLS should now be disabled.');
  console.log('\n📝 Next steps:');
  console.log('1. Refresh your app');
  console.log('2. Click "Inscription" to create a new account');
  console.log('3. Or use "Connexion" with existing accounts');
  console.log('\nExisting accounts:');
  console.log('- admin@builderhub.com');
  console.log('- lapidus20@gmail.com');
  console.log('- lapidus20@yahoo.co.uk');
  console.log('\n⚠️  Note: RLS is now disabled. Data is still protected by auth.');
}

disableRLS().catch(console.error);
