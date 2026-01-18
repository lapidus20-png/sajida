import 'package:supabase_flutter/supabase_flutter.dart';

class NotificationService {
  final _supabase = Supabase.instance.client;

  // Get notifications for user
  Future<List<Map<String, dynamic>>> getNotifications(String userId) async {
    try {
      final response = await _supabase
          .from('notifications')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false)
          .limit(50);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      print('Error getting notifications: $e');
      return [];
    }
  }

  // Get unread notification count
  Future<int> getUnreadCount(String userId) async {
    try {
      final response = await _supabase
          .from('notifications')
          .select()
          .eq('user_id', userId)
          .eq('read', false);

      return response.length;
    } catch (e) {
      print('Error getting unread count: $e');
      return 0;
    }
  }

  // Mark notification as read
  Future<void> markAsRead(String notificationId) async {
    try {
      await _supabase
          .from('notifications')
          .update({'read': true})
          .eq('id', notificationId);
    } catch (e) {
      print('Error marking notification as read: $e');
    }
  }

  // Mark all notifications as read
  Future<void> markAllAsRead(String userId) async {
    try {
      await _supabase
          .from('notifications')
          .update({'read': true})
          .eq('user_id', userId);
    } catch (e) {
      print('Error marking all as read: $e');
    }
  }

  // Delete notification
  Future<bool> deleteNotification(String notificationId) async {
    try {
      await _supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId);
      return true;
    } catch (e) {
      print('Error deleting notification: $e');
      return false;
    }
  }

  // Clear all notifications
  Future<void> clearAll(String userId) async {
    try {
      await _supabase
          .from('notifications')
          .delete()
          .eq('user_id', userId);
    } catch (e) {
      print('Error clearing notifications: $e');
    }
  }

  // Subscribe to new notifications
  RealtimeChannel subscribeToNotifications(
    String userId,
    Function(Map<String, dynamic>) onNotification,
  ) {
    final channel = _supabase
        .channel('notifications:$userId')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'notifications',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'user_id',
            value: userId,
          ),
          callback: (payload) {
            onNotification(payload.newRecord);
          },
        )
        .subscribe();

    return channel;
  }

  // Create notification (for testing/admin)
  Future<bool> createNotification({
    required String userId,
    required String type,
    required String title,
    required String message,
    String? jobId,
    String? quoteId,
  }) async {
    try {
      await _supabase.from('notifications').insert({
        'user_id': userId,
        'type': type,
        'title': title,
        'message': message,
        'job_id': jobId,
        'quote_id': quoteId,
        'read': false,
      });
      return true;
    } catch (e) {
      print('Error creating notification: $e');
      return false;
    }
  }
}
