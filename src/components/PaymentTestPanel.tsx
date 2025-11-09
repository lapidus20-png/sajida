import React, { useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { paymentService } from '../lib/paymentService';
import {
  getProviderStatus,
  validatePaymentAmount,
  formatPhoneNumber,
  getMockPaymentResponse,
  testInstructions,
} from '../lib/paymentTestUtils';

interface PaymentTestResult {
  provider: string;
  success: boolean;
  transactionId?: string;
  message: string;
  timestamp: Date;
}

export default function PaymentTestPanel() {
  const [selectedProvider, setSelectedProvider] = useState<string>('orange_money');
  const [testPhone, setTestPhone] = useState('70123456');
  const [testAmount, setTestAmount] = useState(1000);
  const [useMockMode, setUseMockMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PaymentTestResult[]>([]);

  const providers = [
    { id: 'orange_money', name: 'Orange Money', color: 'bg-orange-500' },
    { id: 'moov_money', name: 'Moov Money', color: 'bg-blue-500' },
    { id: 'wave', name: 'Wave', color: 'bg-green-500' },
    { id: 'telecel_money', name: 'Telecel Money', color: 'bg-purple-500' },
  ];

  const providerStatus = getProviderStatus(selectedProvider);
  const amountValidation = validatePaymentAmount(testAmount, selectedProvider);
  const instructions = testInstructions[selectedProvider as keyof typeof testInstructions];

  const handleTestPayment = async () => {
    if (!amountValidation.valid) {
      alert(amountValidation.error);
      return;
    }

    setLoading(true);

    try {
      let response;

      if (useMockMode) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        response = getMockPaymentResponse(selectedProvider, true);
      } else {
        if (!providerStatus.configured) {
          throw new Error('Fournisseur non configuré. Ajoutez les clés API dans .env');
        }

        const formattedPhone = formatPhoneNumber(testPhone, selectedProvider);

        response = await paymentService.processPayment(selectedProvider, {
          amount: testAmount,
          phone: formattedPhone,
          reference: `TEST_${Date.now()}`,
          description: 'Test de paiement sandbox',
          customerName: 'Test User',
        });
      }

      const result: PaymentTestResult = {
        provider: selectedProvider,
        success: response.success,
        transactionId: response.transactionId,
        message: response.success
          ? response.message || 'Paiement initié avec succès'
          : response.error || 'Échec du paiement',
        timestamp: new Date(),
      };

      setResults([result, ...results]);
    } catch (error) {
      const result: PaymentTestResult = {
        provider: selectedProvider,
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date(),
      };

      setResults([result, ...results]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Test des Paiements Mobiles
            </h2>
            <p className="text-sm text-gray-600">
              Testez les intégrations de paiement en mode sandbox
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Mode Test Activé</p>
              <p>
                En mode "Simulation", aucun appel réel n'est effectué. Ajoutez vos clés API sandbox
                dans le fichier .env et désactivez le mode simulation pour tester les vraies API.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fournisseur de paiement
            </label>
            <div className="grid grid-cols-2 gap-3">
              {providers.map((provider) => {
                const status = getProviderStatus(provider.id);
                return (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      selectedProvider === provider.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{provider.name}</span>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          status.configured ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title={status.configured ? 'Configuré' : 'Non configuré'}
                      />
                    </div>
                    <div className={`h-2 rounded ${provider.color} opacity-20`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="70123456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (FCFA)
              </label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(parseInt(e.target.value) || 0)}
                placeholder="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {!amountValidation.valid && (
                <p className="text-sm text-red-600 mt-1">{amountValidation.error}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="mockMode"
              checked={useMockMode}
              onChange={(e) => setUseMockMode(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="mockMode" className="text-sm text-gray-700">
              Mode Simulation (aucun appel API réel)
            </label>
          </div>

          {!providerStatus.configured && !useMockMode && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-1">Configuration requise</p>
                  <p>{providerStatus.instructions}</p>
                </div>
              </div>
            </div>
          )}

          {instructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-blue-900">{instructions.title}</h3>
                <a
                  href={instructions.sandboxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  Documentation
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <ul className="space-y-2 text-sm text-blue-800">
                {instructions.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleTestPayment}
            disabled={loading || (!amountValidation.valid)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Traitement en cours...' : 'Tester le paiement'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Résultats des tests
          </h3>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-semibold text-gray-900">
                      {result.provider.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {result.timestamp.toLocaleTimeString('fr-FR')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                {result.transactionId && (
                  <p className="text-xs text-gray-600 font-mono">
                    ID: {result.transactionId}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
