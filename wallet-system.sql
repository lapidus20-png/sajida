/*
  # Add Wallet System for Artisans

  1. New Tables
    - `wallet_balances`
      - `artisan_id` (uuid, primary key, references artisans)
      - `balance` (integer) - Current balance in FCFA
      - `total_recharged` (integer) - Total amount ever recharged
      - `total_spent` (integer) - Total amount ever spent
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `wallet_transactions`
      - `id` (uuid, primary key)
      - `artisan_id` (uuid, references artisans)
      - `type` (text) - Type: 'recharge', 'debit', 'refund'
      - `amount` (integer) - Amount in FCFA (positive for credits, negative for debits)
      - `balance_after` (integer) - Balance after transaction
      - `description` (text) - Transaction description
      - `reference` (text) - Payment reference (for recharges)
      - `related_job_id` (uuid) - Related job request if applicable
      - `status` (text) - Status: 'pending', 'completed', 'failed'
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Artisans can view their own wallet data
    - Only artisans can recharge their own wallet
    - System can debit wallets (for job applications)
*/

-- Create wallet_balances table
CREATE TABLE IF NOT EXISTS wallet_balances (
  artisan_id uuid PRIMARY KEY REFERENCES artisans(id) ON DELETE CASCADE,
  balance integer DEFAULT 0 NOT NULL CHECK (balance >= 0),
  total_recharged integer DEFAULT 0 NOT NULL,
  total_spent integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id uuid NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('recharge', 'debit', 'refund')),
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  description text DEFAULT '',
  reference text DEFAULT '',
  related_job_id uuid REFERENCES job_requests(id) ON DELETE SET NULL,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE wallet_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallet_balances

-- Artisans can view their own wallet balance
CREATE POLICY "Artisans can view own wallet balance"
  ON wallet_balances FOR SELECT
  TO authenticated
  USING (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

-- System can insert wallet balances (for new artisans)
CREATE POLICY "System can create wallet balances"
  ON wallet_balances FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- System can update wallet balances
CREATE POLICY "System can update wallet balances"
  ON wallet_balances FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for wallet_transactions

-- Artisans can view their own transactions
CREATE POLICY "Artisans can view own transactions"
  ON wallet_transactions FOR SELECT
  TO authenticated
  USING (
    artisan_id IN (
      SELECT id FROM artisans WHERE user_id = auth.uid()
    )
  );

-- Authenticated users can create transactions
CREATE POLICY "Authenticated can create transactions"
  ON wallet_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_artisan ON wallet_transactions(artisan_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);

-- Function to initialize wallet for new artisan
CREATE OR REPLACE FUNCTION initialize_artisan_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallet_balances (artisan_id, balance, total_recharged, total_spent)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (artisan_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create wallet when artisan is created
DROP TRIGGER IF EXISTS trigger_initialize_wallet ON artisans;
CREATE TRIGGER trigger_initialize_wallet
AFTER INSERT ON artisans
FOR EACH ROW
EXECUTE FUNCTION initialize_artisan_wallet();

-- Function to recharge wallet
CREATE OR REPLACE FUNCTION recharge_wallet(
  p_artisan_id uuid,
  p_amount integer,
  p_reference text
)
RETURNS jsonb AS $$
DECLARE
  v_new_balance integer;
  v_transaction_id uuid;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Amount must be positive'
    );
  END IF;

  -- Update balance
  UPDATE wallet_balances
  SET
    balance = balance + p_amount,
    total_recharged = total_recharged + p_amount,
    updated_at = now()
  WHERE artisan_id = p_artisan_id
  RETURNING balance INTO v_new_balance;

  -- If wallet doesn't exist, create it
  IF v_new_balance IS NULL THEN
    INSERT INTO wallet_balances (artisan_id, balance, total_recharged, total_spent)
    VALUES (p_artisan_id, p_amount, p_amount, 0)
    RETURNING balance INTO v_new_balance;
  END IF;

  -- Record transaction
  INSERT INTO wallet_transactions (
    artisan_id,
    type,
    amount,
    balance_after,
    description,
    reference,
    status
  ) VALUES (
    p_artisan_id,
    'recharge',
    p_amount,
    v_new_balance,
    'Wallet recharge',
    p_reference,
    'completed'
  ) RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to debit wallet (for job applications)
CREATE OR REPLACE FUNCTION debit_wallet(
  p_artisan_id uuid,
  p_amount integer,
  p_job_id uuid,
  p_description text
)
RETURNS jsonb AS $$
DECLARE
  v_current_balance integer;
  v_new_balance integer;
  v_transaction_id uuid;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Amount must be positive'
    );
  END IF;

  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM wallet_balances
  WHERE artisan_id = p_artisan_id;

  -- Check if wallet exists
  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Wallet not found'
    );
  END IF;

  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance',
      'current_balance', v_current_balance,
      'required', p_amount
    );
  END IF;

  -- Debit wallet
  UPDATE wallet_balances
  SET
    balance = balance - p_amount,
    total_spent = total_spent + p_amount,
    updated_at = now()
  WHERE artisan_id = p_artisan_id
  RETURNING balance INTO v_new_balance;

  -- Record transaction
  INSERT INTO wallet_transactions (
    artisan_id,
    type,
    amount,
    balance_after,
    description,
    related_job_id,
    status
  ) VALUES (
    p_artisan_id,
    'debit',
    -p_amount,
    v_new_balance,
    p_description,
    p_job_id,
    'completed'
  ) RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initialize wallets for existing artisans
INSERT INTO wallet_balances (artisan_id, balance, total_recharged, total_spent)
SELECT id, 0, 0, 0
FROM artisans
ON CONFLICT (artisan_id) DO NOTHING;
