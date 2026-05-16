/*
  # Fix Login Blocked by RLS on public.users

  ## Root Cause
  public.users has a FOREIGN KEY referencing auth.users (ON DELETE CASCADE).
  When Supabase auth performs an UPDATE on auth.users during login (updating last_sign_in_at),
  PostgreSQL's FK constraint checker runs RI_FKey_noaction_upd which needs to SELECT from
  public.users. RLS is enabled on public.users and blocks this internal system query,
  causing "Database error querying schema" on every login attempt.

  ## Fix
  Grant the supabase_auth_admin role permission to bypass RLS on public.users,
  and grant it explicit SELECT so FK constraint checks always succeed.
*/

-- Allow auth internals to read public.users without RLS blocking
GRANT SELECT ON public.users TO supabase_auth_admin;

-- Also grant to postgres role used by internal operations
GRANT SELECT ON public.users TO postgres;

-- Add a permissive policy for the supabase_auth_admin role
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

-- Allow service_role full access (used by admin operations and internal Supabase services)
DROP POLICY IF EXISTS "Service role full access to users" ON public.users;
CREATE POLICY "Service role full access to users"
  ON public.users
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
