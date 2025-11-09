import { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Banknote, Plus, CheckCircle, X } from 'lucide-react';
import { supabase, PaymentMethod } from '../lib/supabase';

interface PaymentMethodSelectorProps {
  userId: string;
  onSelect: (methodId: string) => void;
  selectedMethodId?: string;
}

const PAYMENT_PROVIDERS = {
  mobile_money: [
    { id: 'orange_money', name: 'Orange Money', color: 'bg-orange-500', icon: '📱' },
    { id: 'moov_money', name: 'Moov Money', color: 'bg-blue-500', icon: '📱' },
    { id: 'wave', name: 'Wave', color: 'bg-pink-500', icon: '📱' },
    { id: 'telecel_money', name: 'Telecel Money', color: 'bg-purple-600', icon: '📱' },
  ],
  bank_card: [
    { id: 'visa', name: 'Visa', color: 'bg-blue-700', icon: '💳' },
    { id: 'mastercard', name: 'Mastercard', color: 'bg-red-600', icon: '💳' },
  ],
  cash: [
    { id: 'cash', name: 'Espèces', color: 'bg-green-600', icon: '💵' },
  ],
};

export default function PaymentMethodSelector({
  userId,
  onSelect,
  selectedMethodId,
}: PaymentMethodSelectorProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, [userId]);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProviderInfo = (provider: string) => {
    const allProviders = [
      ...PAYMENT_PROVIDERS.mobile_money,
      ...PAYMENT_PROVIDERS.bank_card,
      ...PAYMENT_PROVIDERS.cash,
    ];
    return allProviders.find(p => p.id === provider);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Méthode de paiement</h3>
        <button
          onClick={() => setShowAddMethod(true)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Aucune méthode de paiement enregistrée</p>
          <button
            onClick={() => setShowAddMethod(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une méthode
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map(method => {
            const providerInfo = getProviderInfo(method.provider);
            const isSelected = method.id === selectedMethodId;

            return (
              <button
                key={method.id}
                onClick={() => onSelect(method.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${providerInfo?.color} rounded-lg flex items-center justify-center text-2xl`}>
                    {providerInfo?.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{method.display_name}</p>
                      {method.is_default && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          Par défaut
                        </span>
                      )}
                      {method.is_verified && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {providerInfo?.name}
                      {method.last_four && ` •••• ${method.last_four}`}
                      {method.phone_number && ` • ${method.phone_number}`}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showAddMethod && (
        <AddPaymentMethodModal
          userId={userId}
          onClose={() => setShowAddMethod(false)}
          onSuccess={() => {
            setShowAddMethod(false);
            loadPaymentMethods();
          }}
        />
      )}
    </div>
  );
}

interface AddPaymentMethodModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function AddPaymentMethodModal({ userId, onClose, onSuccess }: AddPaymentMethodModalProps) {
  const [methodType, setMethodType] = useState<'mobile_money' | 'bank_card' | 'cash'>('mobile_money');
  const [provider, setProvider] = useState('orange_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const lastFour = methodType === 'bank_card' ? cardNumber.slice(-4) : undefined;
      const phone = methodType === 'mobile_money' ? phoneNumber : undefined;

      const { error: insertError } = await supabase
        .from('payment_methods')
        .insert({
          user_id: userId,
          method_type: methodType,
          provider,
          display_name: displayName || `${provider} ${lastFour || phone || ''}`,
          last_four: lastFour,
          phone_number: phone,
          is_default: isDefault,
          is_verified: false,
        });

      if (insertError) throw insertError;
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold">Ajouter un moyen de paiement</h2>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-1 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Type de paiement</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMethodType('mobile_money');
                  setProvider('orange_money');
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  methodType === 'mobile_money'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-xs font-medium">Mobile Money</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethodType('bank_card');
                  setProvider('visa');
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  methodType === 'bank_card'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-xs font-medium">Carte bancaire</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethodType('cash');
                  setProvider('cash');
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  methodType === 'cash'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <Banknote className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-xs font-medium">Espèces</p>
              </button>
            </div>
          </div>

          {methodType === 'mobile_money' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Opérateur</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PAYMENT_PROVIDERS.mobile_money.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+226 XX XX XX XX"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {methodType === 'bank_card' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de carte</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PAYMENT_PROVIDERS.bank_card.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de carte</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={16}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {methodType === 'cash' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Le paiement en espèces doit être validé manuellement après remise des fonds.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom d'affichage (optionnel)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ex: Mon Orange Money principal"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-default"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="is-default" className="text-sm text-gray-700">
              Définir comme méthode par défaut
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg"
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
