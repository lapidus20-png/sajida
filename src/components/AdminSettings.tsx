import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BankingAccount {
  bank_name: string;
  account_holder: string;
  account_number: string;
  iban: string;
  swift_bic: string;
  currency: string;
}

interface PlatformCommission {
  percentage: number;
  enabled: boolean;
}

export function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [bankingAccount, setBankingAccount] = useState<BankingAccount>({
    bank_name: '',
    account_holder: '',
    account_number: '',
    iban: '',
    swift_bic: '',
    currency: 'XOF'
  });

  const [commission, setCommission] = useState<PlatformCommission>({
    percentage: 10,
    enabled: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const { data: bankingData, error: bankingError } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'banking_account')
        .maybeSingle();

      if (bankingError) throw bankingError;
      if (bankingData) {
        setBankingAccount(bankingData.setting_value as BankingAccount);
      }

      const { data: commissionData, error: commissionError } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'platform_commission')
        .maybeSingle();

      if (commissionError) throw commissionError;
      if (commissionData) {
        setCommission(commissionData.setting_value as PlatformCommission);
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBanking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('app_settings')
        .update({
          setting_value: bankingAccount,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'banking_account');

      if (error) throw error;

      setMessage({ type: 'success', text: 'Coordonnées bancaires enregistrées avec succès' });
    } catch (error: any) {
      console.error('Error saving banking settings:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('app_settings')
        .update({
          setting_value: commission,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'platform_commission');

      if (error) throw error;

      setMessage({ type: 'success', text: 'Commission mise à jour avec succès' });
    } catch (error: any) {
      console.error('Error saving commission settings:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Paramètres de la plateforme
        </h1>
        <p className="text-gray-600 mt-2">Gérez les paramètres globaux de la plateforme</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Compte bancaire de la plateforme
          </h2>
          <p className="text-gray-600 mb-6">
            Tous les paiements seront transférés vers ce compte bancaire
          </p>

          <form onSubmit={handleSaveBanking} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la banque
              </label>
              <input
                type="text"
                value={bankingAccount.bank_name}
                onChange={(e) => setBankingAccount({ ...bankingAccount, bank_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Banque Atlantique"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titulaire du compte
              </label>
              <input
                type="text"
                value={bankingAccount.account_holder}
                onChange={(e) => setBankingAccount({ ...bankingAccount, account_holder: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Nom de votre entreprise"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de compte
              </label>
              <input
                type="text"
                value={bankingAccount.account_number}
                onChange={(e) => setBankingAccount({ ...bankingAccount, account_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IBAN
              </label>
              <input
                type="text"
                value={bankingAccount.iban}
                onChange={(e) => setBankingAccount({ ...bankingAccount, iban: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: CI93 CI000 01234 56789 012345 67"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code SWIFT/BIC
              </label>
              <input
                type="text"
                value={bankingAccount.swift_bic}
                onChange={(e) => setBankingAccount({ ...bankingAccount, swift_bic: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: ATCICIXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Devise
              </label>
              <select
                value={bankingAccount.currency}
                onChange={(e) => setBankingAccount({ ...bankingAccount, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="XOF">XOF (Franc CFA)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="USD">USD (Dollar)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Enregistrement...' : 'Enregistrer les coordonnées bancaires'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Commission de la plateforme
          </h2>
          <p className="text-gray-600 mb-6">
            Définissez le pourcentage de commission prélevé sur chaque transaction
          </p>

          <form onSubmit={handleSaveCommission} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pourcentage de commission (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={commission.percentage}
                onChange={(e) => setCommission({ ...commission, percentage: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="commission-enabled"
                checked={commission.enabled}
                onChange={(e) => setCommission({ ...commission, enabled: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="commission-enabled" className="text-sm font-medium text-gray-700">
                Activer la commission
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Enregistrement...' : 'Enregistrer la commission'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
