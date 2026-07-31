import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars. Need VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const USERS_TO_CREATE = [
  {
    email: 'admin@builderhub.com',
    password: 'Admin2026!',
    user_type: 'admin',
  },
  {
    email: 'client@test.com',
    password: 'Client2026!',
    user_type: 'client',
  },
  {
    email: 'artisan@test.com',
    password: 'Artisan2026!',
    user_type: 'artisan',
    artisan_data: {
      nom: 'Test',
      prenom: 'Artisan',
      telephone: '+22670000000',
      ville: 'Ouagadougou',
      metier: ['Électricien'],
      disponible: true,
    },
  },
];

async function main() {
  for (const u of USERS_TO_CREATE) {
    console.log(`\nCreating ${u.email}...`);

    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });

    if (error) {
      console.error(`  FAILED: ${error.message}`);
      continue;
    }

    console.log(`  Auth user created: ${data.user.id}`);

    // Insert into public.users
    const { error: profileError } = await supabase.from('users').upsert({
      id: data.user.id,
      email: u.email,
      user_type: u.user_type,
      telephone: u.artisan_data?.telephone || null,
      ville: u.artisan_data?.ville || null,
    });

    if (profileError) {
      console.error(`  Profile insert error: ${profileError.message}`);
    } else {
      console.log(`  Profile created (${u.user_type})`);
    }

    // If artisan, create artisan record
    if (u.user_type === 'artisan' && u.artisan_data) {
      const { error: artisanError } = await supabase.from('artisans').insert({
        user_id: data.user.id,
        nom: u.artisan_data.nom,
        prenom: u.artisan_data.prenom,
        telephone: u.artisan_data.telephone,
        email: u.email,
        ville: u.artisan_data.ville,
        metier: u.artisan_data.metier,
        disponible: u.artisan_data.disponible,
        note_moyenne: 0,
        statut_verification: 'verifie',
        annees_experience: 5,
      });

      if (artisanError) {
        console.error(`  Artisan insert error: ${artisanError.message}`);
      } else {
        console.log(`  Artisan profile created`);
      }
    }

    console.log(`  Done: ${u.email} / ${u.password}`);
  }

  console.log('\n=== All users created ===');
  console.log('Login credentials:');
  console.log('  Admin:    admin@builderhub.com / Admin2026!');
  console.log('  Client:   client@test.com / Client2026!');
  console.log('  Artisan:  artisan@test.com / Artisan2026!');
  console.log('  (existing) daniel@yahoo.fr / (whatever you set)');
}

main().catch(console.error);
