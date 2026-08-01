import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  // List all users on the real project
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  });

  if (listError) {
    console.error('Error listing users:', listError.message);
    process.exit(1);
  }

  console.log(`Found ${usersData.users.length} users on ${supabaseUrl}:`);
  for (const u of usersData.users) {
    console.log(`  - ${u.email} (id: ${u.id}, confirmed: ${!!u.email_confirmed_at})`);
  }

  // Password resets
  const resets = [
    { email: 'admin@artisanbf.com', password: 'admin@2026' },
    { email: 'admin@builderhub.com', password: 'admin@2026' },
    { email: 'client@test.com', password: 'client123' },
    { email: 'artisan@test.com', password: 'artisan123' },
  ];

  for (const { email, password } of resets) {
    const user = usersData.users.find(u => u.email === email);
    if (!user) {
      console.log(`SKIP: ${email} not found on this project`);
      continue;
    }

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });

    if (error) {
      console.error(`FAIL: ${email} -> ${error.message}`);
    } else {
      console.log(`OK: ${email} password set to "${password}"`);
    }
  }

  // Also ensure public.users table has correct user_type
  const { error: adminErr } = await supabase
    .from('users')
    .update({ user_type: 'admin' })
    .in('email', ['admin@artisanbf.com', 'admin@builderhub.com']);

  if (adminErr) console.error('Error updating admin user_type:', adminErr.message);

  const { error: clientErr } = await supabase
    .from('users')
    .update({ user_type: 'client' })
    .eq('email', 'client@test.com');

  if (clientErr) console.error('Error updating client user_type:', clientErr.message);

  const { error: artisanErr } = await supabase
    .from('users')
    .update({ user_type: 'artisan' })
    .eq('email', 'artisan@test.com');

  if (artisanErr) console.error('Error updating artisan user_type:', artisanErr.message);

  console.log('\nDone! Login credentials:');
  console.log('  Admin:    admin@artisanbf.com / admin@2026');
  console.log('  Admin:    admin@builderhub.com / admin@2026');
  console.log('  Client:   client@test.com / client123');
  console.log('  Artisan:  artisan@test.com / artisan123');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
