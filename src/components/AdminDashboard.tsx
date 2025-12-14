import { useState, useEffect } from 'react';
import { BarChart3, Users, AlertCircle, TrendingUp, CheckCircle, Clock, Activity, UserCheck, X } from 'lucide-react';
import { supabase, Artisan } from '../lib/supabase';
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
  artisans: {
    total: number;
    pending: number;
    verified: number;
    rejected: number;
  };
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'jobs' | 'reports' | 'payments' | 'artisans'>('overview');
  const [pendingArtisans, setPendingArtisans] = useState<Artisan[]>([]);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      const [
        usersTotal,
        usersClients,
        usersArtisans,
        jobsTotal,
        jobsPubliees,
        jobsEnCours,
        jobsTerminees,
        quotesTotal,
        quotesAcceptes,
        quotesRefuses,
        quotesEnAttente,
        reviewsTotal,
        reviewsVerified,
        artisansTotal,
        artisansPending,
        artisansVerified,
        artisansRejected,
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('user_type', 'client'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('user_type', 'artisan'),
        supabase.from('job_requests').select('*', { count: 'exact', head: true }),
        supabase.from('job_requests').select('*', { count: 'exact', head: true }).eq('statut', 'publiee'),
        supabase.from('job_requests').select('*', { count: 'exact', head: true }).eq('statut', 'en_cours'),
        supabase.from('job_requests').select('*', { count: 'exact', head: true }).eq('statut', 'terminee'),
        supabase.from('quotes').select('*', { count: 'exact', head: true }),
        supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('statut', 'accepte'),
        supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('statut', 'refuse'),
        supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente'),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('verified', true),
        supabase.from('artisans').select('*', { count: 'exact', head: true }),
        supabase.from('artisans').select('*', { count: 'exact', head: true }).eq('statut_verification', 'en_attente'),
        supabase.from('artisans').select('*', { count: 'exact', head: true }).eq('statut_verification', 'verifie'),
        supabase.from('artisans').select('*', { count: 'exact', head: true }).eq('statut_verification', 'rejete'),
      ]);

      setStats({
        users: {
          total: usersTotal.count || 0,
          clients: usersClients.count || 0,
          artisans: usersArtisans.count || 0,
        },
        jobs: {
          total: jobsTotal.count || 0,
          publiees: jobsPubliees.count || 0,
          en_cours: jobsEnCours.count || 0,
          terminees: jobsTerminees.count || 0,
        },
        quotes: {
          total: quotesTotal.count || 0,
          acceptes: quotesAcceptes.count || 0,
          refuses: quotesRefuses.count || 0,
          en_attente: quotesEnAttente.count || 0,
        },
        reviews: {
          total: reviewsTotal.count || 0,
          verified: reviewsVerified.count || 0,
          pending: (reviewsTotal.count || 0) - (reviewsVerified.count || 0),
        },
        artisans: {
          total: artisansTotal.count || 0,
          pending: artisansPending.count || 0,
          verified: artisansVerified.count || 0,
          rejected: artisansRejected.count || 0,
        },
      });

      const { data: artisansData } = await supabase
        .from('artisans')
        .select('*')
        .eq('statut_verification', 'en_attente')
        .order('created_at', { ascending: false });

      setPendingArtisans(artisansData || []);
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-lg shadow-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Artisans à vérifier</p>
                    <p className="text-4xl font-bold mt-2">{stats.artisans.pending}</p>
                  </div>
                  <UserCheck className="w-12 h-12 opacity-30" />
                </div>
                <p className="text-xs text-yellow-100 mt-4">
                  {stats.artisans.verified} vérifiés • {stats.artisans.rejected} rejetés
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
                    onClick={() => setActiveTab('artisans')}
                    className={`flex-1 sm:flex-none px-6 py-4 font-medium border-b-2 transition-colors ${
                      activeTab === 'artisans'
                        ? 'border-yellow-500 text-yellow-400'
                        : 'border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 inline mr-2" />
                    Vérification Artisans ({stats.artisans.pending})
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

                {activeTab === 'artisans' && (
                  <div className="text-slate-300">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <UserCheck className="w-6 h-6 text-yellow-400" />
                      Artisans en attente de vérification
                    </h3>
                    {pendingArtisans.length === 0 ? (
                      <div className="bg-slate-700 p-4 rounded-lg text-center py-12 text-slate-400">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                        <p>Aucun artisan en attente de vérification</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingArtisans.map(artisan => (
                          <div key={artisan.id} className="bg-slate-700 rounded-lg p-6 border border-slate-600 hover:border-yellow-500 transition-all">
                            <div className="flex items-start gap-6">
                              {artisan.photo_url ? (
                                <img src={artisan.photo_url} alt={artisan.nom} className="w-24 h-24 rounded-lg object-cover" />
                              ) : (
                                <div className="w-24 h-24 rounded-lg bg-slate-600 flex items-center justify-center">
                                  <Users className="w-12 h-12 text-slate-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                  <div>
                                    <h4 className="text-white font-bold text-lg">{artisan.nom} {artisan.prenom}</h4>
                                    <p className="text-yellow-400 font-medium">{artisan.metier}</p>
                                  </div>
                                  <span className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                                    EN ATTENTE
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <p className="text-slate-400 text-sm mb-2">Contact</p>
                                    <p className="text-white text-sm">{artisan.email}</p>
                                    <p className="text-white text-sm">{artisan.telephone}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400 text-sm mb-2">Localisation</p>
                                    <p className="text-white text-sm">{artisan.ville}</p>
                                    <p className="text-white text-sm">{artisan.quartier}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400 text-sm mb-2">Expérience</p>
                                    <p className="text-white text-sm font-semibold">{artisan.annees_experience} ans</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400 text-sm mb-2">Tarif horaire</p>
                                    <p className="text-white text-sm font-semibold">{artisan.tarif_horaire.toLocaleString()} FCFA/h</p>
                                  </div>
                                </div>
                                {artisan.description && (
                                  <div className="mb-4">
                                    <p className="text-slate-400 text-sm mb-1">Description</p>
                                    <p className="text-white text-sm">{artisan.description}</p>
                                  </div>
                                )}
                                {artisan.certifications && artisan.certifications.length > 0 && (
                                  <div className="mb-4">
                                    <p className="text-slate-400 text-sm mb-2">Certifications</p>
                                    <div className="flex flex-wrap gap-2">
                                      {artisan.certifications.map((cert, idx) => (
                                        <span key={idx} className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-xs">
                                          {cert}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="flex gap-3 mt-4">
                                  <button
                                    onClick={async () => {
                                      try {
                                        const { error } = await supabase
                                          .from('artisans')
                                          .update({ statut_verification: 'verifie' })
                                          .eq('id', artisan.id);

                                        if (error) throw error;
                                        await loadAdminStats();
                                      } catch (err) {
                                        console.error('Erreur lors de la vérification:', err);
                                        alert('Erreur lors de la vérification de l\'artisan');
                                      }
                                    }}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                    Approuver
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm('Êtes-vous sûr de vouloir rejeter cet artisan ?')) {
                                        try {
                                          const { error } = await supabase
                                            .from('artisans')
                                            .update({ statut_verification: 'rejete' })
                                            .eq('id', artisan.id);

                                          if (error) throw error;
                                          await loadAdminStats();
                                        } catch (err) {
                                          console.error('Erreur lors du rejet:', err);
                                          alert('Erreur lors du rejet de l\'artisan');
                                        }
                                      }
                                    }}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                  >
                                    <X className="w-5 h-5" />
                                    Rejeter
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
