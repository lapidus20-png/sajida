-- Fix: Restore auth schema RLS policies for anon, authenticated, and authenticator roles
-- The authenticator role switches between anon (unauthenticated) and authenticated (authenticated)
-- so all three need policies on auth tables for the Supabase Auth service to function.

-- ============================================================
-- auth.users
-- ============================================================
DROP POLICY IF EXISTS "auth_users_select" ON auth.users;
DROP POLICY IF EXISTS "auth_users_insert" ON auth.users;
DROP POLICY IF EXISTS "auth_users_update" ON auth.users;
DROP POLICY IF EXISTS "auth_users_delete" ON auth.users;

CREATE POLICY "auth_users_select" ON auth.users
  FOR SELECT TO anon, authenticated, authenticator USING (true);
CREATE POLICY "auth_users_insert" ON auth.users
  FOR INSERT TO anon, authenticated, authenticator WITH CHECK (true);
CREATE POLICY "auth_users_update" ON auth.users
  FOR UPDATE TO anon, authenticated, authenticator USING (true) WITH CHECK (true);
CREATE POLICY "auth_users_delete" ON auth.users
  FOR DELETE TO anon, authenticated, authenticator USING (true);

-- ============================================================
-- auth.identities
-- ============================================================
DROP POLICY IF EXISTS "auth_identities_select" ON auth.identities;
DROP POLICY IF EXISTS "auth_identities_insert" ON auth.identities;
DROP POLICY IF EXISTS "auth_identities_update" ON auth.identities;
DROP POLICY IF EXISTS "auth_identities_delete" ON auth.identities;

CREATE POLICY "auth_identities_select" ON auth.identities
  FOR SELECT TO anon, authenticated, authenticator USING (true);
CREATE POLICY "auth_identities_insert" ON auth.identities
  FOR INSERT TO anon, authenticated, authenticator WITH CHECK (true);
CREATE POLICY "auth_identities_update" ON auth.identities
  FOR UPDATE TO anon, authenticated, authenticator USING (true) WITH CHECK (true);
CREATE POLICY "auth_identities_delete" ON auth.identities
  FOR DELETE TO anon, authenticated, authenticator USING (true);

-- ============================================================
-- auth.sessions
-- ============================================================
DROP POLICY IF EXISTS "auth_sessions_select" ON auth.sessions;
DROP POLICY IF EXISTS "auth_sessions_insert" ON auth.sessions;
DROP POLICY IF EXISTS "auth_sessions_update" ON auth.sessions;
DROP POLICY IF EXISTS "auth_sessions_delete" ON auth.sessions;

CREATE POLICY "auth_sessions_select" ON auth.sessions
  FOR SELECT TO anon, authenticated, authenticator USING (true);
CREATE POLICY "auth_sessions_insert" ON auth.sessions
  FOR INSERT TO anon, authenticated, authenticator WITH CHECK (true);
CREATE POLICY "auth_sessions_update" ON auth.sessions
  FOR UPDATE TO anon, authenticated, authenticator USING (true) WITH CHECK (true);
CREATE POLICY "auth_sessions_delete" ON auth.sessions
  FOR DELETE TO anon, authenticated, authenticator USING (true);

-- ============================================================
-- auth.refresh_tokens
-- ============================================================
DROP POLICY IF EXISTS "auth_refresh_tokens_select" ON auth.refresh_tokens;
DROP POLICY IF EXISTS "auth_refresh_tokens_insert" ON auth.refresh_tokens;
DROP POLICY IF EXISTS "auth_refresh_tokens_update" ON auth.refresh_tokens;
DROP POLICY IF EXISTS "auth_refresh_tokens_delete" ON auth.refresh_tokens;

CREATE POLICY "auth_refresh_tokens_select" ON auth.refresh_tokens
  FOR SELECT TO anon, authenticated, authenticator USING (true);
CREATE POLICY "auth_refresh_tokens_insert" ON auth.refresh_tokens
  FOR INSERT TO anon, authenticated, authenticator WITH CHECK (true);
CREATE POLICY "auth_refresh_tokens_update" ON auth.refresh_tokens
  FOR UPDATE TO anon, authenticated, authenticator USING (true) WITH CHECK (true);
CREATE POLICY "auth_refresh_tokens_delete" ON auth.refresh_tokens
  FOR DELETE TO anon, authenticated, authenticator USING (true);

-- ============================================================
-- auth.mfa_factors
-- ============================================================
DROP POLICY IF EXISTS "auth_mfa_factors_select" ON auth.mfa_factors;
DROP POLICY IF EXISTS "auth_mfa_factors_insert" ON auth.mfa_factors;
DROP POLICY IF EXISTS "auth_mfa_factors_update" ON auth.mfa_factors;
DROP POLICY IF EXISTS "auth_mfa_factors_delete" ON auth.mfa_factors;

CREATE POLICY "auth_mfa_factors_select" ON auth.mfa_factors
  FOR SELECT TO anon, authenticated, authenticator USING (true);
CREATE POLICY "auth_mfa_factors_insert" ON auth.mfa_factors
  FOR INSERT TO anon, authenticated, authenticator WITH CHECK (true);
CREATE POLICY "auth_mfa_factors_update" ON auth.mfa_factors
  FOR UPDATE TO anon, authenticated, authenticator USING (true) WITH CHECK (true);
CREATE POLICY "auth_mfa_factors_delete" ON auth.mfa_factors
  FOR DELETE TO anon, authenticated, authenticator USING (true);

-- ============================================================
-- auth.mfa_challenges
-- ============================================================
DROP POLICY IF EXISTS "auth_mfa_challenges_select" ON auth.mfa_challenges;
DROP POLICY IF EXISTS "auth_mfa_challenges_insert" ON auth.mfa_challenges;
DROP POLICY IF EXISTS "auth_mfa_challenges_update" ON auth.mfa_challenges;
DROP POLICY IF EXISTS "auth_mfa_challenges_delete" ON auth.mfa_challenges;

CREATE POLICY "auth_mfa_challenges_select" ON auth.mfa_challenges
  FOR SELECT TO anon, authenticated, authenticator USING (true);
CREATE POLICY "auth_mfa_challenges_insert" ON auth.mfa_challenges
  FOR INSERT TO anon, authenticated, authenticator WITH CHECK (true);
CREATE POLICY "auth_mfa_challenges_update" ON auth.mfa_challenges
  FOR UPDATE TO anon, authenticated, authenticator USING (true) WITH CHECK (true);
CREATE POLICY "auth_mfa_challenges_delete" ON auth.mfa_challenges
  FOR DELETE TO anon, authenticated, authenticator USING (true);

-- ============================================================
-- auth.mfa_amr_claims
-- ============================================================
CREATE POLICY "auth_mfa_amr_select" ON auth.mfa_amr_claims
  FOR SELECT TO anon, authenticated, authenticator USING (true);
CREATE POLICY "auth_mfa_amr_insert" ON auth.mfa_amr_claims
  FOR INSERT TO anon, authenticated, authenticator WITH CHECK (true);
CREATE POLICY "auth_mfa_amr_update" ON auth.mfa_amr_claims
  FOR UPDATE TO anon, authenticated, authenticator USING (true) WITH CHECK (true);
CREATE POLICY "auth_mfa_amr_delete" ON auth.mfa_amr_claims
  FOR DELETE TO anon, authenticated, authenticator USING (true);

-- ============================================================
-- auth.flow_state
-- ============================================================
DROP POLICY IF EXISTS "auth_flow_state_select" ON auth.flow_state;
DROP POLICY IF EXISTS "auth_flow_state_insert" ON auth.flow_state;
DROP POLICY IF EXISTS "auth_flow_state_update" ON auth.flow_state;
DROP POLICY IF EXISTS "auth_flow_state_delete" ON auth.flow_state;

CREATE POLICY "auth_flow_state_select" ON auth.flow_state
  FOR SELECT TO anon, authenticated, authenticator USING (true);
CREATE POLICY "auth_flow_state_insert" ON auth.flow_state
  FOR INSERT TO anon, authenticated, authenticator WITH CHECK (true);
CREATE POLICY "auth_flow_state_update" ON auth.flow_state
  FOR UPDATE TO anon, authenticated, authenticator USING (true) WITH CHECK (true);
CREATE POLICY "auth_flow_state_delete" ON auth.flow_state
  FOR DELETE TO anon, authenticated, authenticator USING (true);

-- ============================================================
-- auth.one_time_tokens
-- ============================================================
DROP POLICY IF EXISTS "auth_ott_select" ON auth.one_time_tokens;
DROP POLICY IF EXISTS "auth_ott_insert" ON auth.one_time_tokens;
DROP POLICY IF EXISTS "auth_ott_update" ON auth.one_time_tokens;
DROP POLICY IF EXISTS "auth_ott_delete" ON auth.one_time_tokens;

CREATE POLICY "auth_ott_select" ON auth.one_time_tokens
  FOR SELECT TO anon, authenticated, authenticator USING (true);
CREATE POLICY "auth_ott_insert" ON auth.one_time_tokens
  FOR INSERT TO anon, authenticated, authenticator WITH CHECK (true);
CREATE POLICY "auth_ott_update" ON auth.one_time_tokens
  FOR UPDATE TO anon, authenticated, authenticator USING (true) WITH CHECK (true);
CREATE POLICY "auth_ott_delete" ON auth.one_time_tokens
  FOR DELETE TO anon, authenticated, authenticator USING (true);

-- ============================================================
-- auth.audit_log_entries
-- ============================================================
DROP POLICY IF EXISTS "auth_audit_select" ON auth.audit_log_entries;
DROP POLICY IF EXISTS "auth_audit_insert" ON auth.audit_log_entries;
DROP POLICY IF EXISTS "auth_audit_update" ON auth.audit_log_entries;
DROP POLICY IF EXISTS "auth_audit_delete" ON auth.audit_log_entries;

CREATE POLICY "auth_audit_select" ON auth.audit_log_entries
  FOR SELECT TO anon, authenticated, authenticator USING (true);
CREATE POLICY "auth_audit_insert" ON auth.audit_log_entries
  FOR INSERT TO anon, authenticated, authenticator WITH CHECK (true);
CREATE POLICY "auth_audit_update" ON auth.audit_log_entries
  FOR UPDATE TO anon, authenticated, authenticator USING (true) WITH CHECK (true);
CREATE POLICY "auth_audit_delete" ON auth.audit_log_entries
  FOR DELETE TO anon, authenticated, authenticator USING (true);

-- ============================================================
-- auth.instances
-- ============================================================
CREATE POLICY "auth_instances_select" ON auth.instances
  FOR SELECT TO anon, authenticated, authenticator USING (true);
CREATE POLICY "auth_instances_insert" ON auth.instances
  FOR INSERT TO anon, authenticated, authenticator WITH CHECK (true);
CREATE POLICY "auth_instances_update" ON auth.instances
  FOR UPDATE TO anon, authenticated, authenticator USING (true) WITH CHECK (true);
CREATE POLICY "auth_instances_delete" ON auth.instances
  FOR DELETE TO anon, authenticated, authenticator USING (true);

-- ============================================================
-- auth.saml_providers
-- ============================================================
CREATE POLICY "auth_saml_providers_select" ON auth.saml_providers
  FOR SELECT TO anon, authenticated, authenticator USING (true);
CREATE POLICY "auth_saml_providers_insert" ON auth.saml_providers
  FOR INSERT TO anon, authenticated, authenticator WITH CHECK (true);
CREATE POLICY "auth_saml_providers_update" ON auth.saml_providers
  FOR UPDATE TO anon, authenticated, authenticator USING (true) WITH CHECK (true);
CREATE POLICY "auth_saml_providers_delete" ON auth.saml_providers
  FOR DELETE TO anon, authenticated, authenticator USING (true);

-- ============================================================
-- auth.saml_relay_states
-- ============================================================
CREATE POLICY "auth_saml_relay_select" ON auth.saml_relay_states
  FOR SELECT TO anon, authenticated, authenticator USING (true);
CREATE POLICY "auth_saml_relay_insert" ON auth.saml_relay_states
  FOR INSERT TO anon, authenticated, authenticator WITH CHECK (true);
CREATE POLICY "auth_saml_relay_update" ON auth.saml_relay_states
  FOR UPDATE TO anon, authenticated, authenticator USING (true) WITH CHECK (true);
CREATE POLICY "auth_saml_relay_delete" ON auth.saml_relay_states
  FOR DELETE TO anon, authenticated, authenticator USING (true);

-- ============================================================
-- auth.sso_domains
-- ============================================================
CREATE POLICY "auth_sso_domains_select" ON auth.sso_domains
  FOR SELECT TO anon, authenticated, authenticator USING (true);
CREATE POLICY "auth_sso_domains_insert" ON auth.sso_domains
  FOR INSERT TO anon, authenticated, authenticator WITH CHECK (true);
CREATE POLICY "auth_sso_domains_update" ON auth.sso_domains
  FOR UPDATE TO anon, authenticated, authenticator USING (true) WITH CHECK (true);
CREATE POLICY "auth_sso_domains_delete" ON auth.sso_domains
  FOR DELETE TO anon, authenticated, authenticator USING (true);

-- ============================================================
-- auth.sso_providers
-- ============================================================
CREATE POLICY "auth_sso_providers_select" ON auth.sso_providers
  FOR SELECT TO anon, authenticated, authenticator USING (true);
CREATE POLICY "auth_sso_providers_insert" ON auth.sso_providers
  FOR INSERT TO anon, authenticated, authenticator WITH CHECK (true);
CREATE POLICY "auth_sso_providers_update" ON auth.sso_providers
  FOR UPDATE TO anon, authenticated, authenticator USING (true) WITH CHECK (true);
CREATE POLICY "auth_sso_providers_delete" ON auth.sso_providers
  FOR DELETE TO anon, authenticated, authenticator USING (true);

-- ============================================================
-- Grant table privileges to anon and authenticated on auth tables
-- ============================================================
GRANT SELECT ON auth.users TO anon, authenticated;
GRANT SELECT ON auth.identities TO anon, authenticated;
GRANT SELECT ON auth.sessions TO anon, authenticated;
GRANT SELECT ON auth.refresh_tokens TO anon, authenticated;
GRANT SELECT ON auth.mfa_factors TO anon, authenticated;
GRANT SELECT ON auth.mfa_challenges TO anon, authenticated;
GRANT SELECT ON auth.mfa_amr_claims TO anon, authenticated;
GRANT SELECT ON auth.flow_state TO anon, authenticated;
GRANT SELECT ON auth.one_time_tokens TO anon, authenticated;
GRANT SELECT ON auth.audit_log_entries TO anon, authenticated;
GRANT SELECT ON auth.instances TO anon, authenticated;
GRANT SELECT ON auth.saml_providers TO anon, authenticated;
GRANT SELECT ON auth.saml_relay_states TO anon, authenticated;
GRANT SELECT ON auth.sso_domains TO anon, authenticated;
GRANT SELECT ON auth.sso_providers TO anon, authenticated;

-- Grant sequence usage for refresh_tokens_id_seq
GRANT USAGE, SELECT ON SEQUENCE auth.refresh_tokens_id_seq TO anon, authenticated, authenticator;
