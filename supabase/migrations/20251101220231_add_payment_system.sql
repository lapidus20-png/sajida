/*
  # Système de paiement BuilderHub

  1. Nouvelles tables
    - payment_methods: Méthodes de paiement des utilisateurs
    - transactions: Historique des transactions
    - escrow_accounts: Comptes séquestres pour acomptes
    - payment_schedules: Échéanciers de paiement par contrat

  2. Moyens de paiement supportés
    - Mobile Money: Orange Money, Moov Money, Wave
    - Cartes bancaires: Visa, Mastercard
    - Espèces (à valider manuellement)

  3. Sécurité
    - RLS sur toutes les tables
    - Pas de stockage de données sensibles (numéros complets)
    - Tokens uniquement pour cartes
*/

-- Table des méthodes de paiement
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  method_type text NOT NULL CHECK (method_type IN ('mobile_money', 'bank_card', 'cash')),
  provider text NOT NULL CHECK (provider IN ('orange_money', 'moov_money', 'wave', 'visa', 'mastercard', 'cash')),
  display_name text NOT NULL,
  last_four text,
  phone_number text,
  is_default boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE SET NULL,
  payer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  transaction_type text NOT NULL CHECK (transaction_type IN ('acompte', 'paiement_partiel', 'solde', 'remboursement')),
  status text NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'traitement', 'complete', 'echoue', 'annule', 'rembourse')),
  provider_transaction_id text,
  provider_reference text,
  failure_reason text,
  metadata jsonb DEFAULT '{}',
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des comptes séquestres
CREATE TABLE IF NOT EXISTS escrow_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_amount numeric(12, 2) NOT NULL,
  amount_deposited numeric(12, 2) DEFAULT 0,
  amount_released numeric(12, 2) DEFAULT 0,
  amount_held numeric(12, 2) GENERATED ALWAYS AS (amount_deposited - amount_released) STORED,
  status text NOT NULL DEFAULT 'ouvert' CHECK (status IN ('ouvert', 'finance', 'en_cours', 'termine', 'dispute', 'cloture')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des échéanciers de paiement
CREATE TABLE IF NOT EXISTS payment_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  milestone_number integer NOT NULL,
  description text NOT NULL,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  due_date date,
  status text NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'paye', 'en_retard', 'annule')),
  paid_at timestamptz,
  transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(contract_id, milestone_number)
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(user_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_transactions_contract ON transactions(contract_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payer ON transactions(payer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_contract ON escrow_accounts(contract_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_contract ON payment_schedules(contract_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_status ON payment_schedules(status);

-- RLS Policies pour payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
  ON payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON payment_methods FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies pour transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = payer_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create transactions as payer"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = payer_id);

-- RLS Policies pour escrow_accounts
ALTER TABLE escrow_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contract participants can view escrow"
  ON escrow_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contracts
      WHERE contracts.id = escrow_accounts.contract_id
      AND (contracts.client_id = auth.uid() OR contracts.artisan_id = auth.uid())
    )
  );

-- RLS Policies pour payment_schedules
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contract participants can view payment schedule"
  ON payment_schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contracts
      WHERE contracts.id = payment_schedules.contract_id
      AND (contracts.client_id = auth.uid() OR contracts.artisan_id = auth.uid())
    )
  );

-- Fonction pour calculer la commission BuilderHub
CREATE OR REPLACE FUNCTION calculate_platform_fee(amount numeric)
RETURNS numeric AS $$
BEGIN
  -- Commission de 5% sur chaque transaction
  RETURN ROUND(amount * 0.05, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_accounts_updated_at
  BEFORE UPDATE ON escrow_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_schedules_updated_at
  BEFORE UPDATE ON payment_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commentaires
COMMENT ON TABLE payment_methods IS 'Méthodes de paiement enregistrées par les utilisateurs';
COMMENT ON TABLE transactions IS 'Historique de toutes les transactions financières';
COMMENT ON TABLE escrow_accounts IS 'Comptes séquestres pour sécuriser les acomptes';
COMMENT ON TABLE payment_schedules IS 'Échéanciers de paiement par jalons de projet';
COMMENT ON FUNCTION calculate_platform_fee IS 'Calcule la commission BuilderHub (5%)';
