-- Fix: Restore auth schema access for the authenticator role
-- Previous migrations dropped all policies on auth tables, leaving the authenticator role
-- with no access, causing "Database error querying schema" during login.

-- Grant necessary privileges to authenticator on auth.users
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.users TO authenticator;

-- Create permissive policies on auth.users for the authenticator role
-- (These match the default Supabase configuration)
CREATE POLICY "auth_users_select" ON auth.users
  FOR SELECT TO authenticator USING (true);

CREATE POLICY "auth_users_insert" ON auth.users
  FOR INSERT TO authenticator WITH CHECK (true);

CREATE POLICY "auth_users_update" ON auth.users
  FOR UPDATE TO authenticator USING (true) WITH CHECK (true);

CREATE POLICY "auth_users_delete" ON auth.users
  FOR DELETE TO authenticator USING (true);

-- Do the same for auth.identities (needed for login)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'identities' AND relnamespace = 'auth'::regnamespace) THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON auth.identities TO authenticator';
    EXECUTE 'CREATE POLICY "auth_identities_select" ON auth.identities FOR SELECT TO authenticator USING (true)';
    EXECUTE 'CREATE POLICY "auth_identities_insert" ON auth.identities FOR INSERT TO authenticator WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_identities_update" ON auth.identities FOR UPDATE TO authenticator USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_identities_delete" ON auth.identities FOR DELETE TO authenticator USING (true)';
  END IF;
END $$;

-- Do the same for auth.sessions (needed for session management)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'sessions' AND relnamespace = 'auth'::regnamespace) THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON auth.sessions TO authenticator';
    EXECUTE 'CREATE POLICY "auth_sessions_select" ON auth.sessions FOR SELECT TO authenticator USING (true)';
    EXECUTE 'CREATE POLICY "auth_sessions_insert" ON auth.sessions FOR INSERT TO authenticator WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_sessions_update" ON auth.sessions FOR UPDATE TO authenticator USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_sessions_delete" ON auth.sessions FOR DELETE TO authenticator USING (true)';
  END IF;
END $$;

-- Do the same for auth.refresh_tokens (needed for token refresh)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'refresh_tokens' AND relnamespace = 'auth'::regnamespace) THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON auth.refresh_tokens TO authenticator';
    EXECUTE 'CREATE POLICY "auth_refresh_tokens_select" ON auth.refresh_tokens FOR SELECT TO authenticator USING (true)';
    EXECUTE 'CREATE POLICY "auth_refresh_tokens_insert" ON auth.refresh_tokens FOR INSERT TO authenticator WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_refresh_tokens_update" ON auth.refresh_tokens FOR UPDATE TO authenticator USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_refresh_tokens_delete" ON auth.refresh_tokens FOR DELETE TO authenticator USING (true)';
  END IF;
END $$;

-- Do the same for auth.mfa_factors and auth.mfa_challenges
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'mfa_factors' AND relnamespace = 'auth'::regnamespace) THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON auth.mfa_factors TO authenticator';
    EXECUTE 'CREATE POLICY "auth_mfa_factors_select" ON auth.mfa_factors FOR SELECT TO authenticator USING (true)';
    EXECUTE 'CREATE POLICY "auth_mfa_factors_insert" ON auth.mfa_factors FOR INSERT TO authenticator WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_mfa_factors_update" ON auth.mfa_factors FOR UPDATE TO authenticator USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_mfa_factors_delete" ON auth.mfa_factors FOR DELETE TO authenticator USING (true)';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'mfa_challenges' AND relnamespace = 'auth'::regnamespace) THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON auth.mfa_challenges TO authenticator';
    EXECUTE 'CREATE POLICY "auth_mfa_challenges_select" ON auth.mfa_challenges FOR SELECT TO authenticator USING (true)';
    EXECUTE 'CREATE POLICY "auth_mfa_challenges_insert" ON auth.mfa_challenges FOR INSERT TO authenticator WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_mfa_challenges_update" ON auth.mfa_challenges FOR UPDATE TO authenticator USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_mfa_challenges_delete" ON auth.mfa_challenges FOR DELETE TO authenticator USING (true)';
  END IF;
END $$;

-- Do the same for auth.flow_state
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'flow_state' AND relnamespace = 'auth'::regnamespace) THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON auth.flow_state TO authenticator';
    EXECUTE 'CREATE POLICY "auth_flow_state_select" ON auth.flow_state FOR SELECT TO authenticator USING (true)';
    EXECUTE 'CREATE POLICY "auth_flow_state_insert" ON auth.flow_state FOR INSERT TO authenticator WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_flow_state_update" ON auth.flow_state FOR UPDATE TO authenticator USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_flow_state_delete" ON auth.flow_state FOR DELETE TO authenticator USING (true)';
  END IF;
END $$;

-- Do the same for auth.one_time_tokens
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'one_time_tokens' AND relnamespace = 'auth'::regnamespace) THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON auth.one_time_tokens TO authenticator';
    EXECUTE 'CREATE POLICY "auth_ott_select" ON auth.one_time_tokens FOR SELECT TO authenticator USING (true)';
    EXECUTE 'CREATE POLICY "auth_ott_insert" ON auth.one_time_tokens FOR INSERT TO authenticator WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_ott_update" ON auth.one_time_tokens FOR UPDATE TO authenticator USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_ott_delete" ON auth.one_time_tokens FOR DELETE TO authenticator USING (true)';
  END IF;
END $$;

-- Do the same for auth.audit_log_entries
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'audit_log_entries' AND relnamespace = 'auth'::regnamespace) THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON auth.audit_log_entries TO authenticator';
    EXECUTE 'CREATE POLICY "auth_audit_select" ON auth.audit_log_entries FOR SELECT TO authenticator USING (true)';
    EXECUTE 'CREATE POLICY "auth_audit_insert" ON auth.audit_log_entries FOR INSERT TO authenticator WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_audit_update" ON auth.audit_log_entries FOR UPDATE TO authenticator USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "auth_audit_delete" ON auth.audit_log_entries FOR DELETE TO authenticator USING (true)';
  END IF;
END $$;
