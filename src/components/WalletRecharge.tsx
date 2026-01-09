import { useState } from 'react';
import { X, Wallet, CreditCard, Smartphone, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { walletService } from '../lib/walletService';

interface WalletRechargeProps {
  artisanId: string;
  currentBalance: number;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

const RECHARGE_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

export default function WalletRecharge({ artisanId, currentBalance, onClose, onSuccess }: WalletRechargeProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card'>('mobile_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const amount = selectedAmount || parseInt(customAmount) || 0;

  const handleRecharge = async () => {
    if (amount < 500) {
      setError('Le montant minimum est de 500 FCFA');
      return;
    }

    if (paymentMethod === 'mobile_money' && !phoneNumber) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const reference = `RECHARGE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const result = await walletService.rechargeWallet(artisanId, amount, reference);

      if (result.success && result.newBalance !== undefined) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess(result.newBalance!);
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Échec du rechargement');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recharger mon portefeuille</h2>
                <p className="text-sm text-gray-600">
                  Solde actuel: {walletService.formatAmount(currentBalance)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={processing}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Rechargement réussi!</h3>
              <p className="text-gray-600">
                Votre portefeuille a été rechargé de {walletService.formatAmount(amount)}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Montant à recharger
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {RECHARGE_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        selectedAmount === amt
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                      disabled={processing}
                    >
                      {(amt / 1000).toFixed(0)}k FCFA
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    placeholder="Ou entrez un montant personnalisé"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={processing}
                    min="500"
                  />
                  <span className="absolute right-4 top-2.5 text-gray-500 text-sm">FCFA</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mode de paiement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('mobile_money')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'mobile_money'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={processing}
                  >
                    <Smartphone className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <div className="text-sm font-medium text-gray-900">Mobile Money</div>
                    <div className="text-xs text-gray-500">Orange, Moov, etc.</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={processing}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <div className="text-sm font-medium text-gray-900">Carte bancaire</div>
                    <div className="text-xs text-gray-500">Visa, Mastercard</div>
                  </button>
                </div>
              </div>

              {paymentMethod === 'mobile_money' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+226 XX XX XX XX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={processing}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Vous recevrez un code de confirmation sur ce numéro
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {amount > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Montant</span>
                    <span className="text-sm font-medium text-gray-900">
                      {walletService.formatAmount(amount)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Frais de transaction</span>
                    <span className="text-sm font-medium text-gray-900">0 FCFA</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">
                        {walletService.formatAmount(amount)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    Nouveau solde: {walletService.formatAmount(currentBalance + amount)}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={processing}
                >
                  Annuler
                </button>
                <button
                  onClick={handleRecharge}
                  disabled={amount < 500 || processing}
                  className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    `Recharger ${amount > 0 ? walletService.formatAmount(amount) : ''}`
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
