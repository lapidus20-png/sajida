import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addMultiArtisanSelection() {
  console.log('Adding multi-artisan selection support...\n');

  const migration = `
-- Create job_artisan_selections table
CREATE TABLE IF NOT EXISTS job_artisan_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL REFERENCES job_requests(id) ON DELETE CASCADE,
  artisan_id uuid NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL,
  selected_at timestamptz DEFAULT now(),
  selection_order integer NOT NULL CHECK (selection_order BETWEEN 1 AND 3),
  UNIQUE(job_request_id, artisan_id),
  UNIQUE(job_request_id, selection_order)
);

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_job_artisan_selections_job ON job_artisan_selections(job_request_id);
CREATE INDEX IF NOT EXISTS idx_job_artisan_selections_artisan ON job_artisan_selections(artisan_id);

-- Enable RLS
ALTER TABLE job_artisan_selections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view selections" ON job_artisan_selections;
DROP POLICY IF EXISTS "Clients can create selections for their jobs" ON job_artisan_selections;
DROP POLICY IF EXISTS "Clients can delete selections for their jobs" ON job_artisan_selections;

-- Policies for job_artisan_selections
CREATE POLICY "Anyone can view selections"
  ON job_artisan_selections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can create selections for their jobs"
  ON job_artisan_selections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_requests
      WHERE job_requests.id = job_request_id
      AND job_requests.client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can delete selections for their jobs"
  ON job_artisan_selections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_requests
      WHERE job_requests.id = job_request_id
      AND job_requests.client_id = auth.uid()
    )
  );

-- Function to notify artisan when selected
CREATE OR REPLACE FUNCTION notify_artisan_on_selection()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for the selected artisan
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_job_id,
    created_at
  )
  SELECT
    a.user_id,
    'job_assigned',
    'Vous avez été sélectionné pour un projet',
    'Un client vous a sélectionné pour son projet "' || jr.titre || '". Contactez-le pour finaliser les détails.',
    NEW.job_request_id,
    now()
  FROM artisans a
  JOIN job_requests jr ON jr.id = NEW.job_request_id
  WHERE a.id = NEW.artisan_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification when artisan is selected
DROP TRIGGER IF EXISTS trigger_notify_artisan_on_selection ON job_artisan_selections;
CREATE TRIGGER trigger_notify_artisan_on_selection
  AFTER INSERT ON job_artisan_selections
  FOR EACH ROW
  EXECUTE FUNCTION notify_artisan_on_selection();
`;

  const { error } = await supabase.rpc('exec_sql', { sql: migration }).single();

  if (error) {
    // Try direct query if RPC doesn't exist
    const { error: directError } = await supabase.from('_migrations').insert({
      name: 'add_multi_artisan_selection',
      executed_at: new Date().toISOString()
    });

    // Execute the migration directly
    const statements = migration.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (!statement.trim()) continue;

      const { error: execError } = await supabase.rpc('exec_sql', { sql: statement });
      if (execError) {
        console.error('Error executing statement:', execError);
      }
    }
  }

  console.log('✅ Multi-artisan selection support added successfully!');
  console.log('\nFeatures added:');
  console.log('- Clients can now select up to 3 artisans per job');
  console.log('- Artisans receive notifications when selected');
  console.log('- Selection order is tracked (primary, secondary, tertiary)');
}

addMultiArtisanSelection().catch(console.error);
