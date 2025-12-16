import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createNotificationSystem() {
  console.log('🔔 Creating notification system for artisans...\n');

  const sql = `
-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  title text NOT NULL,
  message text NOT NULL,
  related_job_id uuid REFERENCES job_requests(id) ON DELETE CASCADE,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to notify artisans when a new job is created
CREATE OR REPLACE FUNCTION notify_artisans_of_new_job()
RETURNS TRIGGER AS $$
DECLARE
  artisan_record RECORD;
  job_category text;
  artisan_metiers text[];
BEGIN
  -- Only send notifications when status is 'publiee' (published)
  IF NEW.statut = 'publiee' THEN
    job_category := NEW.categorie;

    -- Find all artisans whose metier matches the job category
    FOR artisan_record IN
      SELECT DISTINCT a.user_id, u.nom, u.prenom, a.metier
      FROM artisans a
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id IS NOT NULL
    LOOP
      -- Parse the metier field (which can be a JSON array or a simple text)
      BEGIN
        -- Try to parse as JSON array
        artisan_metiers := ARRAY(SELECT jsonb_array_elements_text(artisan_record.metier::jsonb));
      EXCEPTION WHEN OTHERS THEN
        -- If it's not JSON, treat it as a single value
        artisan_metiers := ARRAY[artisan_record.metier];
      END;

      -- Check if the job category matches any of the artisan's metiers
      IF job_category = ANY(artisan_metiers)
         OR (job_category = 'Électricité' AND ('Électricien' = ANY(artisan_metiers) OR 'Électromécanicien' = ANY(artisan_metiers)))
         OR (job_category = 'Plomberie' AND 'Plombier' = ANY(artisan_metiers))
         OR (job_category = 'Maçonnerie' AND 'Maçon' = ANY(artisan_metiers))
         OR (job_category = 'Menuiserie' AND ('Menuisier' = ANY(artisan_metiers) OR 'Menuisier métallique' = ANY(artisan_metiers)))
         OR (job_category = 'Peinture' AND 'Peintre' = ANY(artisan_metiers))
         OR (job_category = 'Carrelage' AND 'Carreleur' = ANY(artisan_metiers))
         OR (job_category = 'Toiture' AND 'Couvreur' = ANY(artisan_metiers))
         OR (job_category = 'Chauffage' AND 'Chauffagiste' = ANY(artisan_metiers))
         OR (job_category = 'Mécanique' AND ('Mécanicien' = ANY(artisan_metiers) OR 'Électromécanicien' = ANY(artisan_metiers)))
      THEN
        -- Create notification for this artisan
        INSERT INTO notifications (user_id, type, title, message, related_job_id)
        VALUES (
          artisan_record.user_id,
          'info',
          'Nouveau projet disponible',
          format('Un nouveau projet en %s vient d''être publié : "%s" à %s', NEW.categorie, NEW.titre, NEW.localisation),
          NEW.id
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically notify artisans when a job is created or updated
DROP TRIGGER IF EXISTS notify_artisans_on_job_published ON job_requests;
CREATE TRIGGER notify_artisans_on_job_published
  AFTER INSERT OR UPDATE OF statut ON job_requests
  FOR EACH ROW
  WHEN (NEW.statut = 'publiee')
  EXECUTE FUNCTION notify_artisans_of_new_job();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
`;

  try {
    console.log('⏳ Creating notifications table...');
    console.log('⏳ Setting up RLS policies...');
    console.log('⏳ Creating trigger function...');
    console.log('⏳ Creating indexes...\n');

    // Try to execute using RPC if available
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql }).maybeSingle();

    if (rpcError) {
      console.log('ℹ️  RPC method not available. Please run this SQL manually:\n');
      console.log('='.repeat(80));
      console.log(sql);
      console.log('='.repeat(80));
      console.log('\nCopy and paste the SQL above into your Supabase SQL Editor.');
      process.exit(1);
    }

    console.log('✅ Notification system created successfully!\n');
    console.log('How it works:');
    console.log('1. When a client creates a job with status "publiee"');
    console.log('2. All artisans matching the job category receive a notification');
    console.log('3. Artisans can see notifications in their dashboard\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\nPlease run this SQL manually in your Supabase SQL editor:\n');
    console.log('='.repeat(80));
    console.log(sql);
    console.log('='.repeat(80));
    process.exit(1);
  }
}

createNotificationSystem().catch(console.error);
