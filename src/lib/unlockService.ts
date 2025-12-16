import { supabase } from './supabase';

export interface UnlockRecord {
  id: string;
  job_request_id: string;
  artisan_id: string;
  unlock_fee_paid: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  unlocked_at: string;
}

export interface ClientDetails {
  email: string;
  telephone: string;
  nom: string;
  prenom: string;
}

export const unlockService = {
  async checkUnlockStatus(jobRequestId: string, artisanId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('unlocked_client_details')
      .select('id, payment_status')
      .eq('job_request_id', jobRequestId)
      .eq('artisan_id', artisanId)
      .eq('payment_status', 'completed')
      .maybeSingle();

    if (error) {
      console.error('Error checking unlock status:', error);
      return false;
    }

    return !!data;
  },

  async initiateUnlock(jobRequestId: string, artisanId: string, unlockFee: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: existing } = await supabase
        .from('unlocked_client_details')
        .select('id, payment_status')
        .eq('job_request_id', jobRequestId)
        .eq('artisan_id', artisanId)
        .maybeSingle();

      if (existing && existing.payment_status === 'completed') {
        return { success: false, error: 'Client details already unlocked' };
      }

      if (existing && existing.payment_status === 'pending') {
        const { error: updateError } = await supabase
          .from('unlocked_client_details')
          .update({ payment_status: 'completed', unlocked_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('unlocked_client_details')
          .insert({
            job_request_id: jobRequestId,
            artisan_id: artisanId,
            unlock_fee_paid: unlockFee,
            payment_status: 'completed'
          });

        if (insertError) throw insertError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error initiating unlock:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async getClientDetails(jobRequestId: string, artisanId: string): Promise<ClientDetails | null> {
    const isUnlocked = await this.checkUnlockStatus(jobRequestId, artisanId);

    if (!isUnlocked) {
      return null;
    }

    const { data: jobRequest, error: jobError } = await supabase
      .from('job_requests')
      .select('client_id')
      .eq('id', jobRequestId)
      .maybeSingle();

    if (jobError || !jobRequest) {
      console.error('Error fetching job request:', jobError);
      return null;
    }

    const { data: client, error: clientError } = await supabase
      .from('users')
      .select('email, telephone, nom, prenom')
      .eq('id', jobRequest.client_id)
      .maybeSingle();

    if (clientError || !client) {
      console.error('Error fetching client details:', clientError);
      return null;
    }

    return client;
  },

  async getUnlockedJobIds(artisanId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('unlocked_client_details')
      .select('job_request_id')
      .eq('artisan_id', artisanId)
      .eq('payment_status', 'completed');

    if (error) {
      console.error('Error fetching unlocked jobs:', error);
      return [];
    }

    return data.map(record => record.job_request_id);
  }
};
