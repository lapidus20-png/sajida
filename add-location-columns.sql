-- Add location columns to job_requests table
-- Run this in your Supabase SQL Editor

ALTER TABLE job_requests ADD COLUMN IF NOT EXISTS latitude decimal(10, 8);
ALTER TABLE job_requests ADD COLUMN IF NOT EXISTS longitude decimal(11, 8);
