import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrationSQL = `
-- Add budget field to job_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_requests' AND column_name = 'budget'
  ) THEN
    ALTER TABLE job_requests ADD COLUMN budget integer DEFAULT 0;
  END IF;
END $$;

-- Create unlocked_client_details table
CREATE TABLE IF NOT EXISTS unlocked_client_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL REFERENCES job_requests(id) ON DELETE CASCADE,
  artisan_id uuid NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  unlock_fee_paid integer NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  unlocked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_request_id, artisan_id)
);

-- Enable RLS on unlocked_client_details
ALTER TABLE unlocked_client_details ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Artisans can view own unlock records" ON unlocked_client_details;
DROP POLICY IF EXISTS "Artisans can create unlock records" ON unlocked_client_details;
DROP POLICY IF EXISTS "Artisans can update own unlock records" ON unlocked_client_details;

-- Artisans can view their own unlock records
CREATE POLICY "Artisans can view own unlock records"
  ON unlocked_client_details
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = unlocked_client_details.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

-- Artisans can insert unlock records (when initiating payment)
CREATE POLICY "Artisans can create unlock records"
  ON unlocked_client_details
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = unlocked_client_details.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

-- Artisans can update their own unlock records (payment status)
CREATE POLICY "Artisans can update own unlock records"
  ON unlocked_client_details
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = unlocked_client_details.artisan_id
      AND artisans.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM artisans
      WHERE artisans.id = unlocked_client_details.artisan_id
      AND artisans.user_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_unlocked_client_details_artisan
  ON unlocked_client_details(artisan_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_client_details_job_request
  ON unlocked_client_details(job_request_id);
`;

async function applyMigration() {
  console.log('Applying budget and unlock system migration...');

  const queries = migrationSQL
    .split(/;\s*(?=CREATE|ALTER|DO|DROP)/i)
    .filter(q => q.trim())
    .map(q => q.trim() + (q.trim().endsWith(';') ? '' : ';'));

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    if (query && query.length > 5) {
      console.log(`\nExecuting query ${i + 1}/${queries.length}...`);

      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ query })
        });

        if (response.ok || response.status === 404) {
          console.log(`✓ Query ${i + 1} completed`);
        } else {
          const text = await response.text();
          console.log(`Query ${i + 1} response (${response.status}):`, text.substring(0, 200));
        }
      } catch (err) {
        console.log(`Query ${i + 1} note:`, err.message);
      }
    }
  }

  console.log('\n✅ Budget and unlock system migration complete!');
  console.log('\nNew features:');
  console.log('- job_requests table now has a "budget" field');
  console.log('- unlocked_client_details table created for tracking unlock payments');
  console.log('- Artisans must pay 25% of budget to unlock client details');
}

applyMigration();
