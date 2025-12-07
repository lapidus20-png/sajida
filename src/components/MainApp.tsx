import { useState, useEffect } from 'react';
import { supabase, User, Artisan } from '../lib/supabase';
import AuthPage from './AuthPage';
import ClientDashboard from './ClientDashboard';
import ArtisanDashboard from './ArtisanDashboard';
import AdminDashboard from './AdminDashboard';
import NotificationCenter, { Notification } from './NotificationCenter';
import HelpCenter from './HelpCenter';
import { HelpCircle } from 'lucide-react';

export default function MainApp() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout - forcing to show auth page');
        setLoading(false);
      }
    }, 5000);

    checkSession();
    const unsubscribe = setupAuthListener();

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        setLoading(false);
        return;
      }

      if (sessionData.session) {
        setSession(sessionData.session);
        await loadUserData(sessionData.session.user.id);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string, retryCount = 0) => {
    try {
      const [userResult, artisanResult] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('artisans')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()
      ]);

      if (userResult.error) throw userResult.error;

      if (!userResult.data) {
        if (retryCount < 3) {
          console.log(`User profile not found, retrying... (${retryCount + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, 500));
          return loadUserData(userId, retryCount + 1);
        }

        console.error('No user data found after retries. Please contact support.');
        await supabase.auth.signOut();
        return;
      }

      setUser(userResult.data);

      if (userResult.data.user_type === 'artisan' && artisanResult.data) {
        setArtisan(artisanResult.data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      await supabase.auth.signOut();
    }
  };

  const setupAuthListener = () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setSession(session);
        await loadUserData(session.user.id);
      } else {
        setSession(null);
        setUser(null);
        setArtisan(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setArtisan(null);
      addNotification({
        type: 'success',
        title: 'Déconnecté',
        message: 'Vous avez été déconnecté avec succès.',
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const addNotification = (data: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...data,
    };
    setNotifications(prev => [notification, ...prev].slice(0, 10));

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    console.log('No session or user, showing AuthPage. Session:', !!session, 'User:', !!user);
    return <AuthPage onSuccess={checkSession} />;
  }

  console.log('User logged in:', user.email, 'Type:', user.user_type);

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-40 flex gap-3">
        <button
          onClick={() => setShowHelp(true)}
          className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-md border border-gray-200 transition-colors"
          title="Aide"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={markNotificationAsRead}
            onClear={clearNotifications}
          />
        </div>
      </div>

      {user.user_type === 'client' ? (
        <ClientDashboard userId={user.id} onLogout={handleLogout} />
      ) : user.user_type === 'artisan' ? (
        artisan ? (
          <ArtisanDashboard artisanId={artisan.id} userId={user.id} onLogout={handleLogout} />
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de votre profil artisan...</p>
            </div>
          </div>
        )
      ) : user.user_type === 'admin' ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600">Type de profil non reconnu.</p>
            <button
              onClick={handleLogout}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Retour
            </button>
          </div>
        </div>
      )}

      {showHelp && <HelpCenter onClose={() => setShowHelp(false)} />}
    </div>
  );
}
