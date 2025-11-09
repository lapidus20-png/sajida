import { supabase } from './supabase';

export interface PaymentRequest {
  amount: number;
  phone: string;
  reference: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  providerReference?: string;
  checkoutUrl?: string;
  message?: string;
  error?: string;
}

export interface PaymentStatus {
  status: 'en_attente' | 'traitement' | 'complete' | 'echoue' | 'annule';
  transactionId: string;
  providerReference?: string;
  message?: string;
}

class PaymentService {
  private readonly apiUrl = import.meta.env.VITE_SUPABASE_URL;

  async initiateOrangeMoneyPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/functions/v1/process-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'orange_money',
          ...request,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du paiement Orange Money');
      }

      return await response.json();
    } catch (error) {
      console.error('Orange Money error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  async initiateMoovMoneyPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/functions/v1/process-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'moov_money',
          ...request,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du paiement Moov Money');
      }

      return await response.json();
    } catch (error) {
      console.error('Moov Money error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  async initiateWavePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/functions/v1/process-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'wave',
          ...request,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du paiement Wave');
      }

      return await response.json();
    } catch (error) {
      console.error('Wave error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  async initiateTelecelMoneyPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/functions/v1/process-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'telecel_money',
          ...request,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du paiement Telecel Money');
      }

      return await response.json();
    } catch (error) {
      console.error('Telecel Money error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  async processPayment(
    provider: string,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    switch (provider) {
      case 'orange_money':
        return this.initiateOrangeMoneyPayment(request);
      case 'moov_money':
        return this.initiateMoovMoneyPayment(request);
      case 'wave':
        return this.initiateWavePayment(request);
      case 'telecel_money':
        return this.initiateTelecelMoneyPayment(request);
      default:
        return {
          success: false,
          error: 'Fournisseur de paiement non supporté',
        };
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('status, provider_transaction_id, provider_reference, failure_reason')
        .eq('id', transactionId)
        .single();

      if (error) throw error;

      return {
        status: data.status,
        transactionId,
        providerReference: data.provider_reference,
        message: data.failure_reason,
      };
    } catch (error) {
      console.error('Status check error:', error);
      return {
        status: 'echoue',
        transactionId,
        message: 'Impossible de vérifier le statut',
      };
    }
  }

  async updateTransactionStatus(
    transactionId: string,
    status: string,
    providerReference?: string,
    failureReason?: string
  ): Promise<void> {
    await supabase
      .from('transactions')
      .update({
        status,
        provider_reference: providerReference,
        failure_reason: failureReason,
        processed_at: status === 'complete' ? new Date().toISOString() : null,
      })
      .eq('id', transactionId);
  }
}

export const paymentService = new PaymentService();
