/*
  # Fix Security and Performance Issues - FINAL

  1. Indexes for Foreign Keys (11 indexes)
  2. RLS Policy Optimization (24 policies)
  3. Function Search Path Security (8 functions)
*/

-- ================================================
-- PART 1: ADD INDEXES FOR FOREIGN KEYS
-- ================================================

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_artisans_user_id ON artisans(user_id);
CREATE INDEX IF NOT EXISTS idx_avis_service_id ON avis(service_id);
CREATE INDEX IF NOT EXISTS idx_contracts_job_request_id ON contracts(job_request_id);
CREATE INDEX IF NOT EXISTS idx_contracts_quote_id ON contracts(quote_id);
CREATE INDEX IF NOT EXISTS idx_messages_job_request_id ON messages(job_request_id);
CREATE INDEX IF NOT EXISTS idx_messages_quote_id ON messages(quote_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_transaction_id ON payment_schedules(transaction_id);
CREATE INDEX IF NOT EXISTS idx_reviews_contract_id ON reviews(contract_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method_id ON transactions(payment_method_id);

-- ================================================
-- PART 2: OPTIMIZE RLS POLICIES
-- ================================================

-- REVIEWS
DROP POLICY IF EXISTS "Les clients peuvent laisser des avis" ON reviews;
CREATE POLICY "Les clients peuvent laisser des avis" ON reviews FOR INSERT TO authenticated
WITH CHECK (reviewer_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Les utilisateurs ne voient que leurs avis" ON reviews;
CREATE POLICY "Les utilisateurs ne voient que leurs avis" ON reviews FOR SELECT TO authenticated
USING (reviewer_id = (SELECT auth.uid()) OR reviewed_user_id = (SELECT auth.uid()));

-- ADMIN_LOGS
DROP POLICY IF EXISTS "Seuls les admins voient les logs" ON admin_logs;
CREATE POLICY "Seuls les admins voient les logs" ON admin_logs FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = (SELECT auth.uid()) AND users.user_type = 'admin'));

-- TRANSACTIONS
DROP POLICY IF EXISTS "Users can create transactions as payer" ON transactions;
CREATE POLICY "Users can create transactions as payer" ON transactions FOR INSERT TO authenticated
WITH CHECK (payer_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT TO authenticated
USING (payer_id = (SELECT auth.uid()) OR receiver_id = (SELECT auth.uid()));

-- ESCROW_ACCOUNTS
DROP POLICY IF EXISTS "Contract participants can view escrow" ON escrow_accounts;
CREATE POLICY "Contract participants can view escrow" ON escrow_accounts FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM contracts WHERE contracts.id = escrow_accounts.contract_id 
  AND (contracts.client_id = (SELECT auth.uid()) OR contracts.artisan_id = (SELECT auth.uid()))));

-- PAYMENT_SCHEDULES
DROP POLICY IF EXISTS "Contract participants can view payment schedule" ON payment_schedules;
CREATE POLICY "Contract participants can view payment schedule" ON payment_schedules FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM contracts WHERE contracts.id = payment_schedules.contract_id
  AND (contracts.client_id = (SELECT auth.uid()) OR contracts.artisan_id = (SELECT auth.uid()))));

-- PAYMENT_METHODS
DROP POLICY IF EXISTS "Users can view own payment methods" ON payment_methods;
CREATE POLICY "Users can view own payment methods" ON payment_methods FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own payment methods" ON payment_methods;
CREATE POLICY "Users can insert own payment methods" ON payment_methods FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own payment methods" ON payment_methods;
CREATE POLICY "Users can update own payment methods" ON payment_methods FOR UPDATE TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own payment methods" ON payment_methods;
CREATE POLICY "Users can delete own payment methods" ON payment_methods FOR DELETE TO authenticated
USING (user_id = (SELECT auth.uid()));

-- JOB_REQUESTS
DROP POLICY IF EXISTS "Les clients peuvent créer des demandes" ON job_requests;
CREATE POLICY "Les clients peuvent créer des demandes" ON job_requests FOR INSERT TO authenticated
WITH CHECK (client_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Les clients peuvent mettre à jour leurs demandes" ON job_requests;
CREATE POLICY "Les clients peuvent mettre à jour leurs demandes" ON job_requests FOR UPDATE TO authenticated
USING (client_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Tout le monde peut voir les demandes publiées" ON job_requests;
CREATE POLICY "Tout le monde peut voir les demandes publiées" ON job_requests FOR SELECT TO authenticated
USING (statut = 'publiee' OR client_id = (SELECT auth.uid()));

-- USERS
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur profil" ON users;
CREATE POLICY "Les utilisateurs peuvent créer leur profil" ON users FOR INSERT TO authenticated
WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur profil" ON users;
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur profil" ON users FOR UPDATE TO authenticated
USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON users;
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" ON users FOR SELECT TO authenticated
USING (id = (SELECT auth.uid()));

-- QUOTES
DROP POLICY IF EXISTS "Les artisans peuvent créer des devis" ON quotes;
CREATE POLICY "Les artisans peuvent créer des devis" ON quotes FOR INSERT TO authenticated
WITH CHECK (artisan_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Les artisans peuvent modifier leurs devis" ON quotes;
CREATE POLICY "Les artisans peuvent modifier leurs devis" ON quotes FOR UPDATE TO authenticated
USING (artisan_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Les artisans et clients voient les devis pertinents" ON quotes;
CREATE POLICY "Les artisans et clients voient les devis pertinents" ON quotes FOR SELECT TO authenticated
USING (artisan_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM job_requests 
  WHERE job_requests.id = quotes.job_request_id AND job_requests.client_id = (SELECT auth.uid())));

-- CONTRACTS
DROP POLICY IF EXISTS "Clients et artisans voient leurs contrats" ON contracts;
CREATE POLICY "Clients et artisans voient leurs contrats" ON contracts FOR SELECT TO authenticated
USING (client_id = (SELECT auth.uid()) OR artisan_id = (SELECT auth.uid()));

-- PROJECT_TIMELINE
DROP POLICY IF EXISTS "Clients et artisans voient la timeline" ON project_timeline;
CREATE POLICY "Clients et artisans voient la timeline" ON project_timeline FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM contracts WHERE contracts.id = project_timeline.contract_id
  AND (contracts.client_id = (SELECT auth.uid()) OR contracts.artisan_id = (SELECT auth.uid()))));

-- MESSAGES
DROP POLICY IF EXISTS "Les utilisateurs peuvent envoyer des messages" ON messages;
CREATE POLICY "Les utilisateurs peuvent envoyer des messages" ON messages FOR INSERT TO authenticated
WITH CHECK (sender_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Les utilisateurs voient leurs messages" ON messages;
CREATE POLICY "Les utilisateurs voient leurs messages" ON messages FOR SELECT TO authenticated
USING (sender_id = (SELECT auth.uid()) OR recipient_id = (SELECT auth.uid()));

-- ================================================
-- PART 3: FIX FUNCTION SEARCH_PATH
-- ================================================

CREATE OR REPLACE FUNCTION update_artisan_average_rating()
RETURNS TRIGGER SECURITY DEFINER SET search_path = '' LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.artisans SET note_moyenne = (SELECT AVG(note) FROM public.avis WHERE public.avis.artisan_id = NEW.artisan_id)
  WHERE public.artisans.id = NEW.artisan_id;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float SECURITY DEFINER SET search_path = '' LANGUAGE plpgsql AS $$
DECLARE R float := 6371; dLat float; dLon float; a float; c float;
BEGIN
  dLat := radians(lat2 - lat1); dLon := radians(lon2 - lon1);
  a := sin(dLat/2) * sin(dLat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon/2) * sin(dLon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN R * c;
END; $$;

CREATE OR REPLACE FUNCTION calculate_platform_fee(amount numeric)
RETURNS numeric SECURITY DEFINER SET search_path = '' LANGUAGE plpgsql AS $$
BEGIN RETURN amount * 0.05; END; $$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER SECURITY DEFINER SET search_path = '' LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION can_view_contact_info(artisan_uuid uuid, user_uuid uuid)
RETURNS boolean SECURITY DEFINER SET search_path = '' LANGUAGE plpgsql AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.contracts c
    INNER JOIN public.payment_schedules ps ON ps.contract_id = c.id
    INNER JOIN public.transactions t ON t.id = ps.transaction_id
    WHERE c.artisan_id = artisan_uuid AND c.client_id = user_uuid
    AND t.status = 'completed' AND ps.status = 'paid');
END; $$;

CREATE OR REPLACE FUNCTION mask_phone(phone text, can_view boolean)
RETURNS text SECURITY DEFINER SET search_path = '' LANGUAGE plpgsql AS $$
BEGIN
  IF can_view THEN RETURN phone;
  ELSE RETURN CASE WHEN phone IS NULL THEN NULL WHEN length(phone) >= 4 THEN 
    substring(phone from 1 for 2) || ' XX XX ' || substring(phone from length(phone) - 1)
    ELSE 'XX XX XX XX' END;
  END IF;
END; $$;

CREATE OR REPLACE FUNCTION mask_email(email text, can_view boolean)
RETURNS text SECURITY DEFINER SET search_path = '' LANGUAGE plpgsql AS $$
DECLARE at_position integer; username text; domain text;
BEGIN
  IF can_view THEN RETURN email;
  ELSE IF email IS NULL THEN RETURN NULL; END IF;
    at_position := position('@' in email);
    IF at_position = 0 THEN RETURN 'xxxxx@xxxxx.xxx'; END IF;
    username := substring(email from 1 for at_position - 1);
    domain := substring(email from at_position + 1);
    RETURN substring(username from 1 for 1) || repeat('x', greatest(length(username) - 1, 4)) || '@' || domain;
  END IF;
END; $$;

CREATE OR REPLACE FUNCTION update_artisan_note_moyenne()
RETURNS TRIGGER SECURITY DEFINER SET search_path = '' LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.artisans SET 
    note_moyenne = (SELECT AVG(note) FROM public.avis WHERE public.avis.artisan_id = NEW.artisan_id),
    nombre_avis = (SELECT COUNT(*) FROM public.avis WHERE public.avis.artisan_id = NEW.artisan_id)
  WHERE public.artisans.id = NEW.artisan_id;
  RETURN NEW;
END; $$;
