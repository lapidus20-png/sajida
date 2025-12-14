import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixMetierDoubleEncoding() {
  console.log('Checking for double-encoded metier fields...\n');

  const { data: artisans, error } = await supabase
    .from('artisans')
    .select('id, nom, prenom, metier');

  if (error) {
    console.error('Error fetching artisans:', error);
    return;
  }

  console.log(`Found ${artisans.length} artisans\n`);

  let fixedCount = 0;

  for (const artisan of artisans) {
    let needsFixing = false;
    let fixedMetier = artisan.metier;

    function deepParse(value) {
      if (typeof value === 'string') {
        if (value.startsWith('[') || value.startsWith('"')) {
          try {
            const parsed = JSON.parse(value);
            return deepParse(parsed);
          } catch (e) {
            return value;
          }
        }
        return value;
      } else if (Array.isArray(value)) {
        return value.map(item => deepParse(item)).flat();
      }
      return value;
    }

    if (Array.isArray(artisan.metier)) {
      const parsed = artisan.metier.map(item => deepParse(item)).flat();
      if (JSON.stringify(parsed) !== JSON.stringify(artisan.metier)) {
        fixedMetier = parsed;
        needsFixing = true;
      }
    } else if (typeof artisan.metier === 'string') {
      const parsed = deepParse(artisan.metier);
      fixedMetier = Array.isArray(parsed) ? parsed : [parsed];
      needsFixing = true;
    }

    if (needsFixing) {
      console.log(`Fixing artisan: ${artisan.nom} ${artisan.prenom}`);
      console.log(`  Before: ${JSON.stringify(artisan.metier)}`);
      console.log(`  After:  ${JSON.stringify(fixedMetier)}`);

      const { error: updateError } = await supabase
        .from('artisans')
        .update({ metier: fixedMetier })
        .eq('id', artisan.id);

      if (updateError) {
        console.error(`  Error updating: ${updateError.message}`);
      } else {
        console.log(`  ✓ Fixed!\n`);
        fixedCount++;
      }
    }
  }

  console.log(`\nFixed ${fixedCount} artisan(s) with metier encoding issues`);
}

fixMetierDoubleEncoding().catch(console.error);
