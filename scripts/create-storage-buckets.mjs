import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createStorageBuckets() {
  console.log('Creating storage buckets...\n');

  const buckets = [
    {
      id: 'avatars',
      name: 'avatars',
      public: true,
      fileSizeLimit: 2097152, // 2MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
    {
      id: 'portfolios',
      name: 'portfolios',
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
    {
      id: 'documents',
      name: 'documents',
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'project-photos',
      name: 'project-photos',
      public: false,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
  ];

  for (const bucket of buckets) {
    console.log(`Creating bucket: ${bucket.id}...`);

    const { data, error } = await supabase.storage.createBucket(bucket.id, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes,
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`  ✓ Bucket ${bucket.id} already exists`);
      } else {
        console.error(`  ✗ Error creating ${bucket.id}:`, error.message);
      }
    } else {
      console.log(`  ✓ Created ${bucket.id} (${bucket.public ? 'public' : 'private'})`);
    }
  }

  console.log('\nAll buckets processed!');
  console.log('\nNext: Apply storage policies using SQL');
  console.log('Run: node scripts/create-storage-policies.mjs');
}

createStorageBuckets().catch(console.error);
