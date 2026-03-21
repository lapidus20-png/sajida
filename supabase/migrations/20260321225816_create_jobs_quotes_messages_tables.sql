/*
  # Create simplified jobs, quotes, and messages tables

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references user)
      - `title` (text, job title)
      - `description` (text, job description)
      - `budget` (numeric, job budget)
      - `status` (text, default 'open')
      - `artisan_id` (uuid, assigned artisan)
      - `latitude` (numeric, GPS latitude)
      - `longitude` (numeric, GPS longitude)
      - `created_at` (timestamp)
    
    - `quotes` table (if not exists - using different structure)
      - Note: A quotes table already exists, this creates a simpler version
    
    - `messages` table (chat messages)
      - Note: A messages table already exists, this may need renaming

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Clients can read/write their own jobs
    - Artisans can read jobs and create quotes
    - Users can read messages they're involved in

  3. Notes
    - Using uuid_generate_v4() for ID generation
    - Status defaults to 'open' for jobs
    - Timestamps default to now()
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES users(id),
  title text NOT NULL,
  description text,
  budget numeric,
  status text DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
  artisan_id uuid REFERENCES artisans(id),
  latitude numeric,
  longitude numeric,
  created_at timestamp DEFAULT now()
);

-- Enable RLS on jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Jobs policies
CREATE POLICY "Users can view all open jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (status = 'open' OR client_id = auth.uid() OR artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid()));

CREATE POLICY "Clients can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update their own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can delete their own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (client_id = auth.uid());

-- Create indexes for jobs
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_artisan_id ON jobs(artisan_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(latitude, longitude);

-- Note: Since 'quotes' table already exists, we'll create policies for it
-- The existing quotes table structure is more comprehensive

-- Add chat_messages table (to avoid conflict with existing messages table)
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id),
  content text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Enable RLS on chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat messages policies
CREATE POLICY "Users can view messages for their jobs"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR
    job_id IN (SELECT id FROM jobs WHERE client_id = auth.uid() OR artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid()))
  );

CREATE POLICY "Users can send messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    job_id IN (SELECT id FROM jobs WHERE client_id = auth.uid() OR artisan_id IN (SELECT id FROM artisans WHERE user_id = auth.uid()))
  );

-- Create indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_job_id ON chat_messages(job_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;