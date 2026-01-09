import { supabase } from './supabase';

export interface WalletBalance {
  artisan_id: string;
  balance: number;
  total_recharged: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  artisan_id: string;
  type: 'recharge' | 'debit' | 'refund';
  amount: number;
  balance_after: number;
  description: string;
  reference: string;
  related_job_id?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export const APPLICATION_FEE = 1000;

export const walletService = {
  async getBalance(artisanId: string): Promise<WalletBalance | null> {
    const { data, error } = await supabase
      .from('wallet_balances')
      .select('*')
      .eq('artisan_id', artisanId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching wallet balance:', error);
      return null;
    }

    return data;
  },

  async getTransactions(artisanId: string, limit = 20): Promise<WalletTransaction[]> {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('artisan_id', artisanId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  },

  async rechargeWallet(artisanId: string, amount: number, reference: string): Promise<{ success: boolean; error?: string; newBalance?: number }> {
    try {
      const { data, error } = await supabase.rpc('recharge_wallet', {
        p_artisan_id: artisanId,
        p_amount: amount,
        p_reference: reference
      });

      if (error) {
        console.error('Error recharging wallet:', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      return {
        success: true,
        newBalance: data.new_balance
      };
    } catch (error: any) {
      console.error('Error recharging wallet:', error);
      return { success: false, error: error.message };
    }
  },

  async debitWallet(
    artisanId: string,
    amount: number,
    jobId: string,
    description: string
  ): Promise<{ success: boolean; error?: string; newBalance?: number; currentBalance?: number; required?: number }> {
    try {
      const { data, error } = await supabase.rpc('debit_wallet', {
        p_artisan_id: artisanId,
        p_amount: amount,
        p_job_id: jobId,
        p_description: description
      });

      if (error) {
        console.error('Error debiting wallet:', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error,
          currentBalance: data.current_balance,
          required: data.required
        };
      }

      return {
        success: true,
        newBalance: data.new_balance
      };
    } catch (error: any) {
      console.error('Error debiting wallet:', error);
      return { success: false, error: error.message };
    }
  },

  async canApplyForJob(artisanId: string): Promise<{ canApply: boolean; balance: number; fee: number }> {
    const balance = await this.getBalance(artisanId);
    const currentBalance = balance?.balance || 0;

    return {
      canApply: currentBalance >= APPLICATION_FEE,
      balance: currentBalance,
      fee: APPLICATION_FEE
    };
  },

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  }
};
