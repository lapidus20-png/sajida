/*
  # Create test table

  1. New Tables
    - `test`
      - `id` (uuid, primary key) - Unique identifier with auto-generated UUID
      - `created_at` (timestamp) - Timestamp of record creation
  
  2. Security
    - Enable RLS on `test` table
    - Add policy for authenticated users to read all test records
    - Add policy for authenticated users to insert test records
    - Add policy for authenticated users to update their own test records
    - Add policy for authenticated users to delete their own test records
*/

-- Create test table
CREATE TABLE IF NOT EXISTS test (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE test ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all test records
CREATE POLICY "Authenticated users can view test records"
  ON test
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert test records
CREATE POLICY "Authenticated users can insert test records"
  ON test
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update test records
CREATE POLICY "Authenticated users can update test records"
  ON test
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete test records
CREATE POLICY "Authenticated users can delete test records"
  ON test
  FOR DELETE
  TO authenticated
  USING (true);