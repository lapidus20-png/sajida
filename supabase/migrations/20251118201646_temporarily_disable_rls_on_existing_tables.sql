/*
  # Temporarily Disable RLS on Existing Tables

  ## Problem
  - "Database error querying schema" during login
  - Need to isolate if RLS is causing the issue

  ## Solution
  - Temporarily disable RLS on all existing public tables
  - Test if login works without RLS
  - This will help identify the root cause

  ## Tables to disable
  - All public schema tables that currently exist
*/

-- Disable RLS temporarily on all existing tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.avis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_timeline DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs DISABLE ROW LEVEL SECURITY;
