import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, X, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  type: string;
  channel: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  metadata: Record<string, any>;
}

interface NotificationListProps {
  userId: string;
  onClose: () => void;
}

export default function NotificationList({ userId, onClose }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    const subscription = subscribeToNotifications();
    return () => {
      subscription?.unsubscribe();
    };
  }, [userId]);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'payment':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h2 className="font-semibold">Notifications</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-1 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNotificationIcon(notif.type)}</div>
                    <div className="flex-1">
                      {notif.subject && (
                        <h3 className="font-semibold text-gray-900 mb-1">{notif.subject}</h3>
                      )}
                      <p className="text-sm text-gray-700">{notif.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                          {notif.channel === 'email' ? (
                            <>
                              <Mail className="w-3 h-3 inline mr-1" />
                              Email
                            </>
                          ) : (
                            <>
                              <MessageSquare className="w-3 h-3 inline mr-1" />
                              SMS
                            </>
                          )}
                        </span>
                        {notif.status === 'sent' && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            Envoyé
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}