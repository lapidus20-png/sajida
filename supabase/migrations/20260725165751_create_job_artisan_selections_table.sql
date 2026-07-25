/*
# Create job_artisan_selections table

1. New Tables
- `job_artisan_selections` — tracks which artisans a client has selected for a job request
  - `id` (uuid, primary key)
  - `job_request_id` (uuid, references job_requests, cascade delete)
  - `artisan_id` (uuid, references artisans, cascade delete)
  - `quote_id` (uuid, nullable, references quotes)
  - `selection_order` (integer, which choice: 1=first, 2=second, etc.)
  - `selected_at` (timestamptz, default now())

2. Security
- Enable RLS on `job_artisan_selections`.
- Clients can manage selections for their own job requests.
- Artisans can view selections where they are the selected artisan.
*/

CREATE TABLE IF NOT EXISTS job_artisan_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL REFERENCES job_requests(id) ON DELETE CASCADE,
  artisan_id uuid NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL,
  selection_order integer NOT NULL DEFAULT 1,
  selected_at timestamptz DEFAULT now()
);

ALTER TABLE job_artisan_selections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can manage own job selections" ON job_artisan_selections;
CREATE POLICY "Clients can manage own job selections"
ON job_artisan_selections FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM job_requests
    WHERE job_requests.id = job_artisan_selections.job_request_id
    AND job_requests.client_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM job_requests
    WHERE job_requests.id = job_artisan_selections.job_request_id
    AND job_requests.client_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Artisans can view own selections" ON job_artisan_selections;
CREATE POLICY "Artisans can view own selections"
ON job_artisan_selections FOR SELECT
TO authenticated
USING (
  job_artisan_selections.artisan_id IN (
    SELECT artisans.id FROM artisans WHERE artisans.user_id = auth.uid()
  )
);
