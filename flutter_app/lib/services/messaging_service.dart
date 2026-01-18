import 'package:supabase_flutter/supabase_flutter.dart';

class MessagingService {
  final _supabase = Supabase.instance.client;

  // Send message
  Future<bool> sendMessage({
    required String senderId,
    required String receiverId,
    required String content,
    String? jobId,
    String? quoteId,
  }) async {
    try {
      await _supabase.from('messages').insert({
        'sender_id': senderId,
        'receiver_id': receiverId,
        'content': content,
        'job_id': jobId,
        'quote_id': quoteId,
        'read': false,
      });
      return true;
    } catch (e) {
      print('Error sending message: $e');
      return false;
    }
  }

  // Get conversations list
  Future<List<Map<String, dynamic>>> getConversations(String userId) async {
    try {
      final response = await _supabase.rpc('get_conversations', params: {
        'user_id_param': userId,
      });

      return List<Map<String, dynamic>>.from(response ?? []);
    } catch (e) {
      print('Error getting conversations: $e');
      return [];
    }
  }

  // Get messages between two users
  Future<List<Map<String, dynamic>>> getMessages(
    String userId,
    String otherUserId, {
    String? jobId,
    String? quoteId,
  }) async {
    try {
      var query = _supabase
          .from('messages')
          .select('*, sender:users!sender_id(email), receiver:users!receiver_id(email)')
          .or('sender_id.eq.$userId,receiver_id.eq.$userId')
          .or('sender_id.eq.$otherUserId,receiver_id.eq.$otherUserId')
          .order('created_at', ascending: true);

      if (jobId != null) {
        query = query.eq('job_id', jobId);
      }

      if (quoteId != null) {
        query = query.eq('quote_id', quoteId);
      }

      final response = await query;
      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      print('Error getting messages: $e');
      return [];
    }
  }

  // Mark messages as read
  Future<void> markMessagesAsRead(String userId, String otherUserId) async {
    try {
      await _supabase
          .from('messages')
          .update({'read': true})
          .eq('receiver_id', userId)
          .eq('sender_id', otherUserId);
    } catch (e) {
      print('Error marking messages as read: $e');
    }
  }

  // Get unread message count
  Future<int> getUnreadCount(String userId) async {
    try {
      final response = await _supabase
          .from('messages')
          .select()
          .eq('receiver_id', userId)
          .eq('read', false);

      return response.length;
    } catch (e) {
      print('Error getting unread count: $e');
      return 0;
    }
  }

  // Subscribe to new messages
  RealtimeChannel subscribeToMessages(String userId, Function(Map<String, dynamic>) onMessage) {
    final channel = _supabase
        .channel('messages:$userId')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'messages',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'receiver_id',
            value: userId,
          ),
          callback: (payload) {
            onMessage(payload.newRecord);
          },
        )
        .subscribe();

    return channel;
  }

  // Delete message
  Future<bool> deleteMessage(String messageId) async {
    try {
      await _supabase.from('messages').delete().eq('id', messageId);
      return true;
    } catch (e) {
      print('Error deleting message: $e');
      return false;
    }
  }
}
