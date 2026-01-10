-- ============================================
-- MULTI-ARTISAN SELECTION MIGRATION
-- Copy this entire file and paste into Supabase SQL Editor
-- ============================================

-- 1. Create job_artisan_selections table
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

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_artisan_selections_job ON job_artisan_selections(job_request_id);
CREATE INDEX IF NOT EXISTS idx_job_artisan_selections_artisan ON job_artisan_selections(artisan_id);

-- 3. Enable Row Level Security
ALTER TABLE job_artisan_selections ENABLE ROW LEVEL SECURITY;

-- 4. Drop old policies if they exist
DROP POLICY IF EXISTS "Anyone can view selections" ON job_artisan_selections;
DROP POLICY IF EXISTS "Clients can create selections for their jobs" ON job_artisan_selections;
DROP POLICY IF EXISTS "Clients can delete selections for their jobs" ON job_artisan_selections;

-- 5. Create RLS policies
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

-- 6. Create function to send notifications
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

-- 7. Create trigger to auto-send notifications
DROP TRIGGER IF EXISTS trigger_notify_artisan_on_selection ON job_artisan_selections;
CREATE TRIGGER trigger_notify_artisan_on_selection
  AFTER INSERT ON job_artisan_selections
  FOR EACH ROW
  EXECUTE FUNCTION notify_artisan_on_selection();

-- Done! The migration is complete.
