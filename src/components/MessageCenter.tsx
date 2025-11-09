import { useState, useEffect } from 'react';
import { Send, MessageSquare, X, AlertCircle } from 'lucide-react';
import { supabase, Message } from '../lib/supabase';

interface MessageCenterProps {
  userId: string;
  recipientId: string;
  recipientName: string;
  contextId?: string;
  contextType?: 'job' | 'quote';
  onClose: () => void;
}

export default function MessageCenter({
  userId,
  recipientId,
  recipientName,
  contextId,
  contextType,
  onClose,
}: MessageCenterProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMessages();
    const subscription = subscribeToMessages();
    return () => {
      subscription?.unsubscribe();
    };
  }, [userId, recipientId, contextId]);

  const loadMessages = async () => {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (contextId && contextType === 'job') {
        query = query.eq('job_request_id', contextId);
      } else if (contextId && contextType === 'quote') {
        query = query.eq('quote_id', contextId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setMessages(data || []);

      const unreadIds = (data || [])
        .filter(m => m.recipient_id === userId && !m.lu)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ lu: true })
          .in('id', unreadIds);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    return supabase
      .channel(`messages:${userId}:${recipientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id=eq.${userId},recipient_id=eq.${recipientId}),and(sender_id=eq.${recipientId},recipient_id=eq.${userId}))`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          recipient_id: recipientId,
          contenu: newMessage,
          job_request_id: contextType === 'job' ? contextId : null,
          quote_id: contextType === 'quote' ? contextId : null,
          lu: false,
        });

      if (insertError) throw insertError;
      setNewMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-96 flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <h2 className="font-semibold">Chat avec {recipientName}</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-1 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-b border-red-200 p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>Aucun message pour le moment. Commencez la conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isOwn = msg.sender_id === userId;
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.contenu}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2 bg-gray-50 rounded-b-2xl">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}
