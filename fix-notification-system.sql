-- ============================================
-- FIX: Notification System for Job Publishing
-- ============================================
-- This fixes the error when clients try to publish jobs
-- by properly setting up the notifications table and trigger

-- 1. Create notifications table
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

-- 2. Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- 4. Create secure RLS policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to insert notifications (for the trigger)
CREATE POLICY "Users can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 5. Drop and recreate the trigger function with error handling
DROP FUNCTION IF EXISTS notify_artisans_of_new_job() CASCADE;

CREATE OR REPLACE FUNCTION notify_artisans_of_new_job()
RETURNS TRIGGER AS $$
DECLARE
  artisan_record RECORD;
  job_category text;
  artisan_metiers text[];
BEGIN
  -- Only send notifications when status is 'publiee' (published)
  IF NEW.statut = 'publiee' AND (TG_OP = 'INSERT' OR OLD.statut IS DISTINCT FROM NEW.statut) THEN
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
         OR (job_category = 'Isolation' AND 'Plaquiste' = ANY(artisan_metiers))
         OR (job_category = 'Vitrage' AND 'Vitrier' = ANY(artisan_metiers))
         OR (job_category = 'Jardinage' AND 'Jardinier' = ANY(artisan_metiers))
      THEN
        -- Create notification for this artisan
        BEGIN
          INSERT INTO notifications (user_id, type, title, message, related_job_id)
          VALUES (
            artisan_record.user_id,
            'info',
            'Nouveau projet disponible',
            format('Un nouveau projet en %s vient d''être publié : "%s" à %s', NEW.categorie, NEW.titre, COALESCE(NEW.localisation, NEW.ville, 'localisation non spécifiée')),
            NEW.id
          );
        EXCEPTION WHEN OTHERS THEN
          -- Log error but don't fail the entire operation
          RAISE WARNING 'Failed to create notification for artisan %: %', artisan_record.user_id, SQLERRM;
        END;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't let notification errors block job updates
  RAISE WARNING 'Error in notify_artisans_of_new_job: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger to automatically notify artisans when a job is published
DROP TRIGGER IF EXISTS notify_artisans_on_job_published ON job_requests;
CREATE TRIGGER notify_artisans_on_job_published
  AFTER INSERT OR UPDATE OF statut ON job_requests
  FOR EACH ROW
  WHEN (NEW.statut = 'publiee')
  EXECUTE FUNCTION notify_artisans_of_new_job();

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_related_job ON notifications(related_job_id) WHERE related_job_id IS NOT NULL;

-- 8. Verify the setup
DO $$
BEGIN
  -- Check if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    RAISE NOTICE '✓ Notifications table created successfully';
  ELSE
    RAISE WARNING '✗ Notifications table was not created';
  END IF;

  -- Check if trigger exists
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'notify_artisans_on_job_published') THEN
    RAISE NOTICE '✓ Trigger created successfully';
  ELSE
    RAISE WARNING '✗ Trigger was not created';
  END IF;

  RAISE NOTICE 'Setup complete! Clients can now publish jobs and artisans will receive notifications.';
END $$;
