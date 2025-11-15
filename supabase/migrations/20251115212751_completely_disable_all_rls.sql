/*
  # Completely Disable RLS on All Public Tables

  1. Problem
    - RLS was supposedly disabled but policies still exist
    - Tables still have active RLS policies
    
  2. Solution
    - Drop ALL policies on all public tables
    - Disable RLS on all public tables
    - This completely opens up the database (as requested)

  3. Security Warning
    - This removes ALL security restrictions
    - Any authenticated or anonymous user can read/write all data
    - Only use this for development/testing
*/

-- Drop all policies and disable RLS on users table
DROP POLICY IF EXISTS "Allow user profile creation during signup" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on artisans table
DROP POLICY IF EXISTS "Artisans can delete own profile" ON public.artisans;
DROP POLICY IF EXISTS "Artisans can update own profile" ON public.artisans;
DROP POLICY IF EXISTS "Authenticated users can create artisan profile" ON public.artisans;
DROP POLICY IF EXISTS "Authenticated users can view all artisans" ON public.artisans;
DROP POLICY IF EXISTS "Public can view all artisans" ON public.artisans;
DROP POLICY IF EXISTS "Service role full access on artisans" ON public.artisans;
ALTER TABLE public.artisans DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on services table
DROP POLICY IF EXISTS "Authenticated users can view all services" ON public.services;
DROP POLICY IF EXISTS "Tout le monde peut créer une demande de service" ON public.services;
DROP POLICY IF EXISTS "Tout le monde peut mettre à jour les services" ON public.services;
DROP POLICY IF EXISTS "Tout le monde peut voir les services" ON public.services;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on avis table
DROP POLICY IF EXISTS "Authenticated users can view all avis" ON public.avis;
DROP POLICY IF EXISTS "Tout le monde peut créer un avis" ON public.avis;
DROP POLICY IF EXISTS "Tout le monde peut voir les avis" ON public.avis;
ALTER TABLE public.avis DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on job_requests table
DROP POLICY IF EXISTS "Authenticated users can view all job requests" ON public.job_requests;
DROP POLICY IF EXISTS "Les clients peuvent créer des demandes" ON public.job_requests;
DROP POLICY IF EXISTS "Les clients peuvent mettre à jour leurs demandes" ON public.job_requests;
DROP POLICY IF EXISTS "Tout le monde peut voir les demandes publiées" ON public.job_requests;
ALTER TABLE public.job_requests DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on quotes table
DROP POLICY IF EXISTS "Authenticated users can view all quotes" ON public.quotes;
DROP POLICY IF EXISTS "Les artisans et clients voient les devis pertinents" ON public.quotes;
DROP POLICY IF EXISTS "Les artisans peuvent créer des devis" ON public.quotes;
DROP POLICY IF EXISTS "Les artisans peuvent modifier leurs devis" ON public.quotes;
ALTER TABLE public.quotes DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on contracts table
DROP POLICY IF EXISTS "Authenticated users can view all contracts" ON public.contracts;
DROP POLICY IF EXISTS "Clients et artisans voient leurs contrats" ON public.contracts;
DROP POLICY IF EXISTS "Seul le système crée les contrats" ON public.contracts;
ALTER TABLE public.contracts DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on project_timeline table
DROP POLICY IF EXISTS "Authenticated users can view all project timeline" ON public.project_timeline;
DROP POLICY IF EXISTS "Clients et artisans voient la timeline" ON public.project_timeline;
ALTER TABLE public.project_timeline DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on messages table
DROP POLICY IF EXISTS "Authenticated users can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Les utilisateurs peuvent envoyer des messages" ON public.messages;
DROP POLICY IF EXISTS "Les utilisateurs voient leurs messages" ON public.messages;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on reviews table
DROP POLICY IF EXISTS "Authenticated users can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Les clients peuvent laisser des avis" ON public.reviews;
DROP POLICY IF EXISTS "Public can view verified reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can view relevant reviews" ON public.reviews;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- Drop all policies and disable RLS on admin_logs table
DROP POLICY IF EXISTS "Authenticated users can view all admin logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Seuls les admins voient les logs" ON public.admin_logs;
ALTER TABLE public.admin_logs DISABLE ROW LEVEL SECURITY;
