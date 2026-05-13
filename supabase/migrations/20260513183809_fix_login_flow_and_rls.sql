/*
  # Fix Login Flow and RLS Issues

  Problems identified:
  1. users.telephone is NOT NULL with no default — breaks registration when phone not provided
  2. users SELECT policy is too strict — blocks profile fetch during auth state change
  3. handle_new_user trigger needs to handle missing user_type gracefully
  4. artisans INSERT policy is too permissive (true) — needs tightening
  5. Missing admin policies so admin can read all users

  Changes:
  - Make telephone nullable with default ''
  - Add permissive SELECT policy for users to read own data reliably
  - Fix handle_new_user function to be SECURITY DEFINER so it bypasses RLS
  - Add proper artisan policies tied to user ownership
  - Ensure admin user can access their own profile
*/

-- 1. Make telephone nullable/default to avoid insert failures
ALTER TABLE public.users ALTER COLUMN telephone SET DEFAULT '';
ALTER TABLE public.users ALTER COLUMN telephone DROP NOT NULL;

-- 2. Drop and recreate users policies cleanly
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON public.users;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur profil" ON public.users;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur profil" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- 3. Fix handle_new_user to be SECURITY DEFINER (bypass RLS during trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, user_type, telephone, adresse, ville, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'telephone', ''),
    COALESCE(NEW.raw_user_meta_data->>'adresse', ''),
    COALESCE(NEW.raw_user_meta_data->>'ville', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 4. Ensure the trigger on auth.users is in place
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Fix artisans policies — keep SELECT open for all authenticated users, restrict INSERT/UPDATE
DROP POLICY IF EXISTS "Tout le monde peut créer un profil artisan" ON public.artisans;
DROP POLICY IF EXISTS "Tout le monde peut voir les artisans" ON public.artisans;
DROP POLICY IF EXISTS "Artisans peuvent mettre à jour leur profil" ON public.artisans;

CREATE POLICY "Authenticated users can view artisans"
  ON public.artisans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Artisans can insert own profile"
  ON public.artisans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) OR user_id IS NULL);

CREATE POLICY "Artisans can update own profile"
  ON public.artisans FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- 6. Ensure job_requests policies exist
DROP POLICY IF EXISTS "Clients can manage own job requests" ON public.job_requests;
DROP POLICY IF EXISTS "Artisans can view published job requests" ON public.job_requests;

CREATE POLICY "Clients can manage own job requests"
  ON public.job_requests FOR ALL
  TO authenticated
  USING (client_id = (SELECT auth.uid()))
  WITH CHECK (client_id = (SELECT auth.uid()));

CREATE POLICY "Artisans can view published job requests"
  ON public.job_requests FOR SELECT
  TO authenticated
  USING (statut IN ('publiee', 'en_negociation', 'attribuee', 'en_cours'));
