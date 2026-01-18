import 'package:supabase_flutter/supabase_flutter.dart';

class WalletService {
  final _supabase = Supabase.instance.client;

  // Get wallet balance
  Future<double> getWalletBalance(String userId) async {
    try {
      final response = await _supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', userId)
          .maybeSingle();

      if (response == null) {
        // Create wallet if it doesn't exist
        await _createWallet(userId);
        return 0.0;
      }

      return (response['balance'] as num).toDouble();
    } catch (e) {
      print('Error getting wallet balance: $e');
      return 0.0;
    }
  }

  // Create wallet
  Future<void> _createWallet(String userId) async {
    try {
      await _supabase.from('wallets').insert({
        'user_id': userId,
        'balance': 0.0,
      });
    } catch (e) {
      print('Error creating wallet: $e');
    }
  }

  // Recharge wallet
  Future<bool> rechargeWallet(
    String userId,
    double amount,
    String paymentMethod,
    String transactionId,
  ) async {
    try {
      // Add transaction record
      await _supabase.from('wallet_transactions').insert({
        'user_id': userId,
        'type': 'credit',
        'amount': amount,
        'payment_method': paymentMethod,
        'transaction_id': transactionId,
        'status': 'completed',
        'description': 'Recharge wallet',
      });

      // Update wallet balance
      final currentBalance = await getWalletBalance(userId);
      await _supabase
          .from('wallets')
          .update({'balance': currentBalance + amount})
          .eq('user_id', userId);

      return true;
    } catch (e) {
      print('Error recharging wallet: $e');
      return false;
    }
  }

  // Debit wallet (for unlocking client details)
  Future<bool> debitWallet(
    String userId,
    double amount,
    String description,
  ) async {
    try {
      final currentBalance = await getWalletBalance(userId);

      if (currentBalance < amount) {
        return false; // Insufficient funds
      }

      // Add transaction record
      await _supabase.from('wallet_transactions').insert({
        'user_id': userId,
        'type': 'debit',
        'amount': amount,
        'status': 'completed',
        'description': description,
      });

      // Update wallet balance
      await _supabase
          .from('wallets')
          .update({'balance': currentBalance - amount})
          .eq('user_id', userId);

      return true;
    } catch (e) {
      print('Error debiting wallet: $e');
      return false;
    }
  }

  // Get transaction history
  Future<List<Map<String, dynamic>>> getTransactionHistory(String userId) async {
    try {
      final response = await _supabase
          .from('wallet_transactions')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false)
          .limit(50);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      print('Error getting transaction history: $e');
      return [];
    }
  }

  // Check if artisan has unlocked client details for a job
  Future<bool> hasUnlockedClientDetails(String artisanUserId, String jobId) async {
    try {
      final response = await _supabase
          .from('unlocked_clients')
          .select()
          .eq('artisan_user_id', artisanUserId)
          .eq('job_id', jobId)
          .maybeSingle();

      return response != null;
    } catch (e) {
      print('Error checking unlock status: $e');
      return false;
    }
  }

  // Unlock client details (costs 25% of job budget)
  Future<bool> unlockClientDetails(
    String artisanUserId,
    String jobId,
    double jobBudget,
  ) async {
    try {
      // Check if already unlocked
      if (await hasUnlockedClientDetails(artisanUserId, jobId)) {
        return true;
      }

      // Calculate unlock fee (25% of budget)
      final unlockFee = jobBudget * 0.25;

      // Debit wallet
      final success = await debitWallet(
        artisanUserId,
        unlockFee,
        'Déblocage coordonnées client pour demande #$jobId',
      );

      if (!success) {
        return false; // Insufficient funds
      }

      // Record unlock
      await _supabase.from('unlocked_clients').insert({
        'artisan_user_id': artisanUserId,
        'job_id': jobId,
        'unlock_fee': unlockFee,
      });

      return true;
    } catch (e) {
      print('Error unlocking client details: $e');
      return false;
    }
  }

  // Get client contact info if unlocked
  Future<Map<String, dynamic>?> getClientContactInfo(
    String artisanUserId,
    String jobId,
  ) async {
    try {
      // Check if unlocked
      if (!await hasUnlockedClientDetails(artisanUserId, jobId)) {
        return null;
      }

      // Get job and client info
      final response = await _supabase
          .from('job_requests')
          .select('client_id, users!inner(telephone, email)')
          .eq('id', jobId)
          .single();

      return {
        'telephone': response['users']['telephone'],
        'email': response['users']['email'],
      };
    } catch (e) {
      print('Error getting client contact info: $e');
      return null;
    }
  }

  // Calculate unlock fee
  double calculateUnlockFee(double jobBudget) {
    return jobBudget * 0.25;
  }
}
