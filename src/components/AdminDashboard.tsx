import { useState, useEffect } from 'react';
import { BarChart3, Users, AlertCircle, TrendingUp, CheckCircle, Clock, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PaymentTestPanel from './PaymentTestPanel';

interface AdminStats {
  users: {
    total: number;
    clients: number;
    artisans: number;
  };
  jobs: {
    total: number;
    publiees: number;
    en_cours: number;
    terminees: number;
  };
  quotes: {
    total: number;
    acceptes: number;
    refuses: number;
    en_attente: number;
  };
  reviews: {
    total: number;
    verified: number;
    pending: number;
  };
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'jobs' | 'reports' | 'payments'>('overview');

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      const [usersRes, jobsRes, quotesRes, reviewsRes] = await Promise.all([
        supabase.from('users').select('user_type', { count: 'exact' }),
        supabase.from('job_requests').select('statut', { count: 'exact' }),
        supabase.from('quotes').select('statut', { count: 'exact' }),
        supabase.from('reviews').select('verified', { count: 'exact' }),
      ]);

      const usersData = usersRes.data || [];
      const jobsData = jobsRes.data || [];
      const quotesData = quotesRes.data || [];
      const reviewsData = reviewsRes.data || [];

      setStats({
        users: {
          total: usersRes.count || 0,
          clients: usersData.filter(u => u.user_type === 'client').length,
          artisans: usersData.filter(u => u.user_type === 'artisan').length,
        },
        jobs: {
          total: jobsRes.count || 0,
          publiees: jobsData.filter(j => j.statut === 'publiee').length,
          en_cours: jobsData.filter(j => j.statut === 'en_cours').length,
          terminees: jobsData.filter(j => j.statut === 'terminee').length,
        },
        quotes: {
          total: quotesRes.count || 0,
          acceptes: quotesData.filter(q => q.statut === 'accepte').length,
          refuses: quotesData.filter(q => q.statut === 'refuse').length,
          en_attente: quotesData.filter(q => q.statut === 'en_attente').length,
        },
        reviews: {
          total: reviewsRes.count || 0,
          verified: reviewsData.filter(r => r.verified).length,
          pending: reviewsData.filter(r => !r.verified).length,
        },
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-950 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-slate-400">Gestion de la plateforme</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : !stats ? (
          <div className="text-center py-12 text-slate-300">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Erreur lors du chargement des données</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Utilisateurs totaux</p>
                    <p className="text-4xl font-bold mt-2">{stats.users.total}</p>
                  </div>
                  <Users className="w-12 h-12 opacity-30" />
                </div>
                <p className="text-xs text-blue-100 mt-4">
                  {stats.users.clients} clients • {stats.users.artisans} artisans
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-lg shadow-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Demandes</p>
                    <p className="text-4xl font-bold mt-2">{stats.jobs.total}</p>
                  </div>
                  <Activity className="w-12 h-12 opacity-30" />
                </div>
                <p className="text-xs text-emerald-100 mt-4">
                  {stats.jobs.en_cours} en cours • {stats.jobs.terminees} terminées
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Devis</p>
                    <p className="text-4xl font-bold mt-2">{stats.quotes.total}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 opacity-30" />
                </div>
                <p className="text-xs text-purple-100 mt-4">
                  {stats.quotes.acceptes} acceptés • {stats.quotes.en_attente} en attente
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Avis</p>
                    <p className="text-4xl font-bold mt-2">{stats.reviews.total}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 opacity-30" />
                </div>
                <p className="text-xs text-orange-100 mt-4">
                  {stats.reviews.verified} vérifiés • {stats.reviews.pending} en attente
                </p>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700">
              <div className="border-b border-slate-700">
                <div className="flex flex-wrap gap-0">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 sm:flex-none px-6 py-4 font-medium border-b-2 transition-colors ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Aperçu
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 sm:flex-none px-6 py-4 font-medium border-b-2 transition-colors ${
                      activeTab === 'users'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Utilisateurs
                  </button>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className={`flex-1 sm:flex-none px-6 py-4 font-medium border-b-2 transition-colors ${
                      activeTab === 'jobs'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Demandes
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`flex-1 sm:flex-none px-6 py-4 font-medium border-b-2 transition-colors ${
                      activeTab === 'reports'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Rapports
                  </button>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className={`flex-1 sm:flex-none px-6 py-4 font-medium border-b-2 transition-colors ${
                      activeTab === 'payments'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Tests Paiements
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-700 p-6 rounded-lg">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-400" />
                          Distribution des utilisateurs
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm text-slate-300 mb-1">
                              <span>Clients</span>
                              <span>{Math.round((stats.users.clients / stats.users.total) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${(stats.users.clients / stats.users.total) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm text-slate-300 mb-1">
                              <span>Artisans</span>
                              <span>{Math.round((stats.users.artisans / stats.users.total) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${(stats.users.artisans / stats.users.total) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-700 p-6 rounded-lg">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-purple-400" />
                          Statut des devis
                        </h3>
                        <div className="space-y-3">
                          <div className="text-sm text-slate-300">
                            <span className="text-green-400 font-semibold">{stats.quotes.acceptes}</span> acceptés
                          </div>
                          <div className="text-sm text-slate-300">
                            <span className="text-yellow-400 font-semibold">{stats.quotes.en_attente}</span> en attente
                          </div>
                          <div className="text-sm text-slate-300">
                            <span className="text-red-400 font-semibold">{stats.quotes.refuses}</span> refusés
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-700 p-6 rounded-lg">
                      <h3 className="text-white font-semibold mb-4">KPIs principaux</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-slate-400 text-sm mb-2">Taux d'acceptation</p>
                          <p className="text-3xl font-bold text-green-400">
                            {stats.quotes.total > 0 ? Math.round((stats.quotes.acceptes / stats.quotes.total) * 100) : 0}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400 text-sm mb-2">Taux de complétion</p>
                          <p className="text-3xl font-bold text-blue-400">
                            {stats.jobs.total > 0 ? Math.round((stats.jobs.terminees / stats.jobs.total) * 100) : 0}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400 text-sm mb-2">Avis vérifiés</p>
                          <p className="text-3xl font-bold text-purple-400">
                            {stats.reviews.total > 0 ? Math.round((stats.reviews.verified / stats.reviews.total) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="text-slate-300">
                    <h3 className="text-white font-semibold mb-4">Gestion des utilisateurs</h3>
                    <div className="bg-slate-700 p-4 rounded-lg text-center py-12 text-slate-400">
                      <p>Section de modération des utilisateurs en développement</p>
                    </div>
                  </div>
                )}

                {activeTab === 'jobs' && (
                  <div className="text-slate-300">
                    <h3 className="text-white font-semibold mb-4">Gestion des demandes</h3>
                    <div className="bg-slate-700 p-4 rounded-lg text-center py-12 text-slate-400">
                      <p>Section de modération des demandes en développement</p>
                    </div>
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="text-slate-300">
                    <h3 className="text-white font-semibold mb-4">Rapports et analyses</h3>
                    <div className="bg-slate-700 p-4 rounded-lg text-center py-12 text-slate-400">
                      <p>Rapports détaillés en développement</p>
                    </div>
                  </div>
                )}

                {activeTab === 'payments' && (
                  <PaymentTestPanel />
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
