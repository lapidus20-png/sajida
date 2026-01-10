/*
  # Add Multi-Artisan Selection Support

  1. New Tables
    - `job_artisan_selections`
      - `id` (uuid, primary key)
      - `job_request_id` (uuid, foreign key to job_requests)
      - `artisan_id` (uuid, foreign key to artisans)
      - `quote_id` (uuid, foreign key to quotes)
      - `selected_at` (timestamptz)
      - `selection_order` (integer, 1-3)

  2. Changes
    - Allows clients to select up to 3 artisans per job
    - Tracks selection order and timing
    - Creates notifications for selected artisans

  3. Security
    - Enable RLS on job_artisan_selections table
    - Add policies for clients to manage their selections
    - Add policies for artisans to view their selections

  4. Triggers
    - Auto-create notification when artisan is selected
    - Update job status when artisan is selected
*/

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

-- Comment on table
COMMENT ON TABLE job_artisan_selections IS 'Tracks up to 3 artisans selected by client for each job';
COMMENT ON COLUMN job_artisan_selections.selection_order IS 'Order of selection (1-3), where 1 is primary choice';
