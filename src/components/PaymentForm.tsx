import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, CheckCircle, X, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { paymentService } from '../lib/paymentService';
import PaymentMethodSelector from './PaymentMethodSelector';

interface PaymentFormProps {
  contractId: string;
  payerId: string;
  receiverId: string;
  amount: number;
  transactionType: 'acompte' | 'paiement_partiel' | 'solde' | 'remboursement';
  description: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({
  contractId,
  payerId,
  receiverId,
  amount,
  transactionType,
  description,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'processing'>('select');

  const platformFee = Math.round(amount * 0.05 * 100) / 100;
  const totalAmount = amount + platformFee;

  const getTransactionLabel = () => {
    switch (transactionType) {
      case 'acompte':
        return 'Acompte';
      case 'paiement_partiel':
        return 'Paiement partiel';
      case 'solde':
        return 'Solde final';
      case 'remboursement':
        return 'Remboursement';
      default:
        return 'Paiement';
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedMethodId) {
      setError('Veuillez sélectionner une méthode de paiement');
      return;
    }

    setStep('processing');
    setLoading(true);
    setError('');

    try {
      const { data: paymentMethod } = await supabase
        .from('payment_methods')
        .select('provider, phone_number')
        .eq('id', selectedMethodId)
        .single();

      if (!paymentMethod) throw new Error('Méthode de paiement introuvable');

      const reference = `BH-${Date.now()}-${contractId.slice(0, 8)}`;

      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          contract_id: contractId,
          payer_id: payerId,
          receiver_id: receiverId,
          payment_method_id: selectedMethodId,
          amount: amount,
          transaction_type: transactionType,
          status: 'en_attente',
          provider_transaction_id: reference,
          metadata: {
            platform_fee: platformFee,
            total_charged: totalAmount,
            description: description,
          },
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      if (paymentMethod.provider !== 'cash') {
        const paymentResult = await paymentService.processPayment(
          paymentMethod.provider,
          {
            amount: totalAmount,
            phone: paymentMethod.phone_number || '',
            reference: reference,
            description: description,
          }
        );

        if (!paymentResult.success) {
          await supabase
            .from('transactions')
            .update({
              status: 'echoue',
              failure_reason: paymentResult.error
            })
            .eq('id', transaction.id);

          throw new Error(paymentResult.error || 'Échec du paiement');
        }

        await supabase
          .from('transactions')
          .update({
            status: 'traitement',
            provider_reference: paymentResult.providerReference
          })
          .eq('id', transaction.id);

        if (paymentResult.checkoutUrl) {
          window.open(paymentResult.checkoutUrl, '_blank');
        }
      }

      if (transactionType === 'acompte') {
        const { error: escrowError } = await supabase
          .from('escrow_accounts')
          .update({
            amount_deposited: amount,
            status: 'finance',
          })
          .eq('contract_id', contractId);

        if (escrowError) throw escrowError;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du paiement');
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white flex items-center justify-between rounded-t-2xl sticky top-0">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">{getTransactionLabel()}</h2>
              <p className="text-green-100 text-sm">{description}</p>
            </div>
          </div>
          <button onClick={onCancel} className="hover:bg-white hover:bg-opacity-20 p-1 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Détails du paiement</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant</span>
                <span className="font-semibold text-gray-900">{amount.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frais de plateforme (5%)</span>
                <span className="font-semibold text-gray-900">{platformFee.toLocaleString()} FCFA</span>
              </div>
              <div className="border-t border-blue-200 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total à payer</span>
                <span className="font-bold text-blue-600 text-xl">{totalAmount.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {step === 'select' && (
            <>
              <PaymentMethodSelector
                userId={payerId}
                onSelect={setSelectedMethodId}
                selectedMethodId={selectedMethodId}
              />

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Les fonds seront mis en séquestre et ne seront libérés à l'artisan qu'après validation des travaux.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!selectedMethodId}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
                >
                  Continuer
                </button>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Confirmer le paiement</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Vous êtes sur le point de payer <strong>{totalAmount.toLocaleString()} FCFA</strong> pour {description.toLowerCase()}.
                </p>
                <p className="text-sm text-gray-600">
                  Le paiement sera traité immédiatement et les fonds seront mis en sécurité jusqu'à la validation des travaux.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Retour
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg"
                >
                  {loading ? 'Traitement...' : 'Confirmer et payer'}
                </button>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Traitement du paiement...</h3>
              <p className="text-gray-600">Veuillez patienter, cela peut prendre quelques instants.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
