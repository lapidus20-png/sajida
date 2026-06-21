/*
  # Fix Login: Grant supabase_auth_admin RLS bypass

  ## Problem
  supabase_auth_admin has SELECT privilege on public.users but rolbypassrls=false,
  so RLS still blocks the FK constraint triggers during login.

  ## Fix
  Add a permissive policy that explicitly allows supabase_auth_admin full access.
*/

-- Permissive policy for supabase_auth_admin (used by internal auth FK checks)
DROP POLICY IF EXISTS "Auth admin full access" ON public.users;
CREATE POLICY "Auth admin full access"
  ON public.users
  AS PERMISSIVE
  FOR ALL
  TO supabase_auth_admin
  USING (true)
  WITH CHECK (true);

-- Also allow the authenticator role (used by PostgREST during auth flow)
DROP POLICY IF EXISTS "Authenticator full access" ON public.users;
CREATE POLICY "Authenticator full access"
  ON public.users
  AS PERMISSIVE
  FOR ALL
  TO authenticator
  USING (true)
  WITH CHECK (true);
