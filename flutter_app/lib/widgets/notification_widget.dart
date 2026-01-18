import 'package:flutter/material.dart';
import '../services/notification_service.dart';

class NotificationWidget extends StatefulWidget {
  final String userId;

  const NotificationWidget({Key? key, required this.userId}) : super(key: key);

  @override
  State<NotificationWidget> createState() => _NotificationWidgetState();
}

class _NotificationWidgetState extends State<NotificationWidget> {
  final _notificationService = NotificationService();
  List<Map<String, dynamic>> _notifications = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    final notifications = await _notificationService.getNotifications(widget.userId);

    setState(() {
      _notifications = notifications;
      _loading = false;
    });
  }

  Future<void> _markAsRead(String notificationId) async {
    await _notificationService.markAsRead(notificationId);
    _loadNotifications();
  }

  Future<void> _markAllAsRead() async {
    await _notificationService.markAllAsRead(widget.userId);
    _loadNotifications();
  }

  Future<void> _deleteNotification(String notificationId) async {
    await _notificationService.deleteNotification(notificationId);
    _loadNotifications();
  }

  Future<void> _clearAll() async {
    await _notificationService.clearAll(widget.userId);
    _loadNotifications();
  }

  IconData _getIconForType(String type) {
    switch (type) {
      case 'success':
        return Icons.check_circle;
      case 'warning':
        return Icons.warning;
      case 'error':
        return Icons.error;
      case 'info':
      default:
        return Icons.info;
    }
  }

  Color _getColorForType(String type) {
    switch (type) {
      case 'success':
        return Colors.green;
      case 'warning':
        return Colors.orange;
      case 'error':
        return Colors.red;
      case 'info':
      default:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return Column(
      children: [
        // Header with actions
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Notifications',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Row(
                children: [
                  TextButton(
                    onPressed: _notifications.any((n) => n['read'] == false)
                        ? _markAllAsRead
                        : null,
                    child: const Text('Tout marquer lu'),
                  ),
                  TextButton(
                    onPressed: _notifications.isNotEmpty ? _clearAll : null,
                    child: const Text(
                      'Tout effacer',
                      style: TextStyle(color: Colors.red),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Notifications list
        Expanded(
          child: _notifications.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.notifications_none,
                        size: 64,
                        color: Colors.grey,
                      ),
                      SizedBox(height: 16),
                      Text(
                        'Aucune notification',
                        style: TextStyle(
                          color: Colors.grey,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  itemCount: _notifications.length,
                  itemBuilder: (context, index) {
                    final notification = _notifications[index];
                    final isRead = notification['read'] == true;
                    final type = notification['type'] ?? 'info';

                    return Dismissible(
                      key: Key(notification['id']),
                      direction: DismissDirection.endToStart,
                      background: Container(
                        color: Colors.red,
                        alignment: Alignment.centerRight,
                        padding: const EdgeInsets.only(right: 20),
                        child: const Icon(
                          Icons.delete,
                          color: Colors.white,
                        ),
                      ),
                      onDismissed: (_) {
                        _deleteNotification(notification['id']);
                      },
                      child: Card(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 4,
                        ),
                        color: isRead ? Colors.white : Colors.blue[50],
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: _getColorForType(type).withOpacity(0.2),
                            child: Icon(
                              _getIconForType(type),
                              color: _getColorForType(type),
                            ),
                          ),
                          title: Text(
                            notification['title'] ?? 'Notification',
                            style: TextStyle(
                              fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                            ),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 4),
                              Text(notification['message'] ?? ''),
                              const SizedBox(height: 4),
                              Text(
                                DateTime.parse(notification['created_at'])
                                    .toString()
                                    .split('.')[0],
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Colors.grey,
                                ),
                              ),
                            ],
                          ),
                          trailing: !isRead
                              ? IconButton(
                                  icon: const Icon(Icons.check),
                                  onPressed: () => _markAsRead(notification['id']),
                                )
                              : null,
                          isThreeLine: true,
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
