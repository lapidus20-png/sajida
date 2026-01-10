-- Add App Settings Table for Banking Account Configuration

-- Create app settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Admin can read all settings
DROP POLICY IF EXISTS "Admins can read app settings" ON app_settings;
CREATE POLICY "Admins can read app settings"
  ON app_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admin can update settings
DROP POLICY IF EXISTS "Admins can update app settings" ON app_settings;
CREATE POLICY "Admins can update app settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admin can insert settings
DROP POLICY IF EXISTS "Admins can insert app settings" ON app_settings;
CREATE POLICY "Admins can insert app settings"
  ON app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create initial banking account setting
INSERT INTO app_settings (setting_key, setting_value, description)
VALUES
  (
    'banking_account',
    jsonb_build_object(
      'bank_name', '',
      'account_holder', '',
      'account_number', '',
      'iban', '',
      'swift_bic', '',
      'currency', 'XOF'
    ),
    'Platform banking account where all payments are transferred'
  ),
  (
    'platform_commission',
    jsonb_build_object(
      'percentage', 10,
      'enabled', true
    ),
    'Platform commission percentage on transactions'
  )
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);

-- Create function to update app setting
CREATE OR REPLACE FUNCTION update_app_setting(
  p_setting_key text,
  p_setting_value jsonb
)
RETURNS app_settings AS $$
DECLARE
  result app_settings;
BEGIN
  UPDATE app_settings
  SET
    setting_value = p_setting_value,
    updated_at = now(),
    updated_by = auth.uid()
  WHERE setting_key = p_setting_key
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
