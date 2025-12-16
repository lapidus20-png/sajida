import { useState, useEffect } from 'react';
import { BarChart3, Users, AlertCircle, TrendingUp, CheckCircle, Clock, Activity, UserCheck, X, Mail, Phone, MapPin, Calendar, DollarSign, FileText, Ban, Eye, Trash2 } from 'lucide-react';
import { supabase, Artisan, User as UserType, JobRequest } from '../lib/supabase';
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
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [allJobRequests, setAllJobRequests] = useState<JobRequest[]>([]);
  const [userFilter, setUserFilter] = useState<'all' | 'client' | 'artisan' | 'admin'>('all');
  const [jobFilter, setJobFilter] = useState<'all' | 'publiee' | 'en_cours' | 'terminee' | 'annulee'>('all');

  useEffect(() => {
    loadAdminStats();
    loadUsers();
    loadJobRequests();
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

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadJobRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('job_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllJobRequests(data || []);
    } catch (error) {
      console.error('Error loading job requests:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      alert('Utilisateur supprimé avec succès');
      loadUsers();
      loadAdminStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleDeleteJobRequest = async (jobId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) return;

    try {
      const { error } = await supabase
        .from('job_requests')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      alert('Demande supprimée avec succès');
      loadJobRequests();
      loadAdminStats();
    } catch (error) {
      console.error('Error deleting job request:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const filteredUsers = allUsers.filter(user => userFilter === 'all' || user.user_type === userFilter);
  const filteredJobRequests = allJobRequests.filter(job => jobFilter === 'all' || job.statut === jobFilter);

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
                                    <p className="text-yellow-400 font-medium">
                                      {(() => {
                                        const metiers = artisan.metier ? (Array.isArray(artisan.metier) ? artisan.metier : [artisan.metier]) : [];
                                        return metiers.length > 0 && metiers[0]
                                          ? metiers.join(', ')
                                          : 'Métier non spécifié';
                                      })()}
                                    </p>
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
                                    <p className="text-slate-400 text-sm mb-2">Informations personnelles</p>
                                    {artisan.date_naissance && (
                                      <p className="text-white text-sm">
                                        Âge: {new Date().getFullYear() - new Date(artisan.date_naissance).getFullYear()} ans
                                      </p>
                                    )}
                                    {artisan.genre && (
                                      <p className="text-white text-sm capitalize">{artisan.genre}</p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-slate-400 text-sm mb-2">Localisation</p>
                                    <p className="text-white text-sm">{artisan.ville}</p>
                                    <p className="text-white text-sm">{artisan.quartier}</p>
                                    {artisan.adresse && (
                                      <p className="text-white text-sm text-xs mt-1">{artisan.adresse}</p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-slate-400 text-sm mb-2">Expérience & Tarif</p>
                                    <p className="text-white text-sm font-semibold">{artisan.annees_experience} ans d'expérience</p>
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
                                {artisan.assurance_rcpro && (
                                  <div className="mb-4">
                                    <div className="flex items-center gap-2 bg-green-900 text-green-200 px-3 py-2 rounded-lg inline-block">
                                      <CheckCircle className="w-4 h-4" />
                                      <span className="text-sm font-medium">Assurance RC Pro</span>
                                    </div>
                                  </div>
                                )}
                                {artisan.photo_id_url && (
                                  <div className="mb-4">
                                    <p className="text-slate-400 text-sm mb-2">Pièce d'identité</p>
                                    <div className="relative inline-block">
                                      <img
                                        src={artisan.photo_id_url}
                                        alt="Pièce d'identité"
                                        className="max-w-xs rounded-lg border-2 border-slate-600 hover:border-yellow-500 transition-all cursor-pointer"
                                        onClick={() => window.open(artisan.photo_id_url, '_blank')}
                                      />
                                      {artisan.photo_id_verified && (
                                        <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                          <CheckCircle className="w-3 h-3" />
                                          Vérifié
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {artisan.portefeuille && artisan.portefeuille.length > 0 && (
                                  <div className="mb-4">
                                    <p className="text-slate-400 text-sm mb-2">Portfolio ({artisan.portefeuille.length} photos)</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      {artisan.portefeuille.map((photo, idx) => (
                                        <img
                                          key={idx}
                                          src={photo}
                                          alt={`Portfolio ${idx + 1}`}
                                          className="w-full h-32 object-cover rounded-lg border border-slate-600 hover:border-blue-500 transition-all cursor-pointer"
                                          onClick={() => window.open(photo, '_blank')}
                                        />
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
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-white font-semibold text-xl flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-400" />
                        Gestion des utilisateurs
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setUserFilter('all')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            userFilter === 'all'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          Tous ({allUsers.length})
                        </button>
                        <button
                          onClick={() => setUserFilter('client')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            userFilter === 'client'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          Clients ({allUsers.filter(u => u.user_type === 'client').length})
                        </button>
                        <button
                          onClick={() => setUserFilter('artisan')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            userFilter === 'artisan'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          Artisans ({allUsers.filter(u => u.user_type === 'artisan').length})
                        </button>
                        <button
                          onClick={() => setUserFilter('admin')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            userFilter === 'admin'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          Admins ({allUsers.filter(u => u.user_type === 'admin').length})
                        </button>
                      </div>
                    </div>

                    {filteredUsers.length === 0 ? (
                      <div className="bg-slate-700 p-4 rounded-lg text-center py-12 text-slate-400">
                        <Users className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                        <p>Aucun utilisateur trouvé</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredUsers.map(user => (
                          <div key={user.id} className="bg-slate-700 rounded-lg p-5 border border-slate-600 hover:border-blue-500 transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                    user.user_type === 'admin' ? 'bg-purple-600' :
                                    user.user_type === 'artisan' ? 'bg-emerald-600' :
                                    'bg-blue-600'
                                  }`}>
                                    {user.email.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <h4 className="text-white font-bold">{user.email}</h4>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                      user.user_type === 'admin' ? 'bg-purple-500 text-white' :
                                      user.user_type === 'artisan' ? 'bg-emerald-500 text-white' :
                                      'bg-blue-500 text-white'
                                    }`}>
                                      {user.user_type.toUpperCase()}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div className="flex items-center gap-2 text-slate-300">
                                    <Mail className="w-4 h-4 text-blue-400" />
                                    <span>{user.email}</span>
                                  </div>
                                  {user.telephone && (
                                    <div className="flex items-center gap-2 text-slate-300">
                                      <Phone className="w-4 h-4 text-green-400" />
                                      <span>{user.telephone}</span>
                                    </div>
                                  )}
                                  {user.ville && (
                                    <div className="flex items-center gap-2 text-slate-300">
                                      <MapPin className="w-4 h-4 text-red-400" />
                                      <span>{user.ville}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-slate-300">
                                    <Calendar className="w-4 h-4 text-purple-400" />
                                    <span>Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'jobs' && (
                  <div className="text-slate-300">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-white font-semibold text-xl flex items-center gap-2">
                        <FileText className="w-6 h-6 text-emerald-400" />
                        Gestion des demandes
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setJobFilter('all')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            jobFilter === 'all'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          Toutes ({allJobRequests.length})
                        </button>
                        <button
                          onClick={() => setJobFilter('publiee')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            jobFilter === 'publiee'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          Publiées ({allJobRequests.filter(j => j.statut === 'publiee').length})
                        </button>
                        <button
                          onClick={() => setJobFilter('en_cours')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            jobFilter === 'en_cours'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          En cours ({allJobRequests.filter(j => j.statut === 'en_cours').length})
                        </button>
                        <button
                          onClick={() => setJobFilter('terminee')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            jobFilter === 'terminee'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          Terminées ({allJobRequests.filter(j => j.statut === 'terminee').length})
                        </button>
                        <button
                          onClick={() => setJobFilter('annulee')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            jobFilter === 'annulee'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          Annulées ({allJobRequests.filter(j => j.statut === 'annulee').length})
                        </button>
                      </div>
                    </div>

                    {filteredJobRequests.length === 0 ? (
                      <div className="bg-slate-700 p-4 rounded-lg text-center py-12 text-slate-400">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                        <p>Aucune demande trouvée</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredJobRequests.map(job => (
                          <div key={job.id} className="bg-slate-700 rounded-lg p-5 border border-slate-600 hover:border-emerald-500 transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="text-white font-bold text-lg mb-1">{job.titre}</h4>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                      job.statut === 'publiee' ? 'bg-blue-500 text-white' :
                                      job.statut === 'en_cours' ? 'bg-yellow-500 text-yellow-900' :
                                      job.statut === 'terminee' ? 'bg-green-500 text-white' :
                                      job.statut === 'annulee' ? 'bg-red-500 text-white' :
                                      'bg-purple-500 text-white'
                                    }`}>
                                      {job.statut.toUpperCase().replace('_', ' ')}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-slate-300 text-sm mb-4 line-clamp-2">{job.description}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                  <div className="flex items-center gap-2 text-slate-300">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                    <span className="font-medium">{job.categorie}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-300">
                                    <MapPin className="w-4 h-4 text-red-400" />
                                    <span>{job.ville}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-300">
                                    <DollarSign className="w-4 h-4 text-green-400" />
                                    <span>{job.budget.toLocaleString()} FCFA</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-300">
                                    <Calendar className="w-4 h-4 text-purple-400" />
                                    <span>Créée le {new Date(job.created_at).toLocaleDateString('fr-FR')}</span>
                                  </div>
                                </div>

                                {job.date_souhaitee && (
                                  <div className="mt-3 text-sm text-slate-400">
                                    <Clock className="w-4 h-4 inline mr-2" />
                                    Date souhaitée: {new Date(job.date_souhaitee).toLocaleDateString('fr-FR')}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => handleDeleteJobRequest(job.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="text-slate-300">
                    <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-purple-400" />
                      Rapports et analyses
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <div className="bg-slate-700 rounded-lg p-6">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-emerald-400" />
                          Croissance des utilisateurs
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-300">Total des utilisateurs</span>
                              <span className="text-white font-bold">{stats.users.total}</span>
                            </div>
                            <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '100%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-300">Clients</span>
                              <span className="text-blue-400 font-bold">{stats.users.clients}</span>
                            </div>
                            <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${(stats.users.clients / stats.users.total) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-300">Artisans</span>
                              <span className="text-emerald-400 font-bold">{stats.users.artisans}</span>
                            </div>
                            <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${(stats.users.artisans / stats.users.total) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-700 rounded-lg p-6">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-purple-400" />
                          Activité des demandes
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-300">Total des demandes</span>
                              <span className="text-white font-bold">{stats.jobs.total}</span>
                            </div>
                            <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '100%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-300">Publiées</span>
                              <span className="text-blue-400 font-bold">{stats.jobs.publiees}</span>
                            </div>
                            <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${stats.jobs.total > 0 ? (stats.jobs.publiees / stats.jobs.total) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-300">En cours</span>
                              <span className="text-yellow-400 font-bold">{stats.jobs.en_cours}</span>
                            </div>
                            <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-500"
                                style={{ width: `${stats.jobs.total > 0 ? (stats.jobs.en_cours / stats.jobs.total) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-300">Terminées</span>
                              <span className="text-green-400 font-bold">{stats.jobs.terminees}</span>
                            </div>
                            <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{ width: `${stats.jobs.total > 0 ? (stats.jobs.terminees / stats.jobs.total) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                      <div className="bg-slate-700 rounded-lg p-6">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          Taux de conversion
                        </h4>
                        <div className="text-center">
                          <div className="text-5xl font-bold text-green-400 mb-2">
                            {stats.quotes.total > 0 ? Math.round((stats.quotes.acceptes / stats.quotes.total) * 100) : 0}%
                          </div>
                          <p className="text-slate-400 text-sm">Devis acceptés</p>
                          <p className="text-slate-500 text-xs mt-2">
                            {stats.quotes.acceptes} acceptés sur {stats.quotes.total} devis
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-700 rounded-lg p-6">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-yellow-400" />
                          Taux de complétion
                        </h4>
                        <div className="text-center">
                          <div className="text-5xl font-bold text-blue-400 mb-2">
                            {stats.jobs.total > 0 ? Math.round((stats.jobs.terminees / stats.jobs.total) * 100) : 0}%
                          </div>
                          <p className="text-slate-400 text-sm">Projets terminés</p>
                          <p className="text-slate-500 text-xs mt-2">
                            {stats.jobs.terminees} terminés sur {stats.jobs.total} demandes
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-700 rounded-lg p-6">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-purple-400" />
                          Taux de vérification
                        </h4>
                        <div className="text-center">
                          <div className="text-5xl font-bold text-purple-400 mb-2">
                            {stats.reviews.total > 0 ? Math.round((stats.reviews.verified / stats.reviews.total) * 100) : 0}%
                          </div>
                          <p className="text-slate-400 text-sm">Avis vérifiés</p>
                          <p className="text-slate-500 text-xs mt-2">
                            {stats.reviews.verified} vérifiés sur {stats.reviews.total} avis
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-slate-700 rounded-lg p-6">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-yellow-400" />
                          Statut des artisans
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm">Vérifiés</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500"
                                  style={{ width: `${stats.artisans.total > 0 ? (stats.artisans.verified / stats.artisans.total) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-green-400 font-bold text-sm w-12 text-right">{stats.artisans.verified}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm">En attente</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-500"
                                  style={{ width: `${stats.artisans.total > 0 ? (stats.artisans.pending / stats.artisans.total) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-yellow-400 font-bold text-sm w-12 text-right">{stats.artisans.pending}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm">Rejetés</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-red-500"
                                  style={{ width: `${stats.artisans.total > 0 ? (stats.artisans.rejected / stats.artisans.total) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-red-400 font-bold text-sm w-12 text-right">{stats.artisans.rejected}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-700 rounded-lg p-6">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-purple-400" />
                          Statut des devis
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm">Acceptés</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500"
                                  style={{ width: `${stats.quotes.total > 0 ? (stats.quotes.acceptes / stats.quotes.total) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-green-400 font-bold text-sm w-12 text-right">{stats.quotes.acceptes}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm">En attente</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-500"
                                  style={{ width: `${stats.quotes.total > 0 ? (stats.quotes.en_attente / stats.quotes.total) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-yellow-400 font-bold text-sm w-12 text-right">{stats.quotes.en_attente}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm">Refusés</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-red-500"
                                  style={{ width: `${stats.quotes.total > 0 ? (stats.quotes.refuses / stats.quotes.total) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-red-400 font-bold text-sm w-12 text-right">{stats.quotes.refuses}</span>
                            </div>
                          </div>
                        </div>
                      </div>
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
