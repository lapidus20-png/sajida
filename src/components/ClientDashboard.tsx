import { useState, useEffect } from 'react';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, MessageSquare, Eye, Edit2 } from 'lucide-react';
import { supabase, JobRequest, Quote } from '../lib/supabase';
import JobRequestForm from './JobRequestForm';

interface ClientDashboardProps {
  userId: string;
  onLogout: () => void;
}

export default function ClientDashboard({ userId, onLogout }: ClientDashboardProps) {
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [activeTab, setActiveTab] = useState<'demandes' | 'devis' | 'stats'>('demandes');
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);

  useEffect(() => {
    if (userId === 'demo') {
      loadDemoData();
    } else {
      loadData();
    }
  }, [userId]);

  const loadDemoData = () => {
    setLoading(true);
    setTimeout(() => {
      setJobRequests([
        {
          id: 'demo-1',
          client_id: 'demo',
          titre: 'Rénovation salle de bain',
          description: 'Rénovation complète d\'une salle de bain de 8m² : changement carrelage, plomberie, électricité',
          categorie: 'plomberie',
          statut: 'publiee',
          budget_min: 2000000,
          budget_max: 2500000,
          localisation: 'Zone 1, Secteur 4',
          ville: 'Ouagadougou',
          date_souhaitee: new Date(Date.now() + 5184000000).toISOString().split('T')[0],
          date_limite_devis: new Date(Date.now() + 1296000000).toISOString().split('T')[0],
          images_url: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'demo-2',
          client_id: 'demo',
          titre: 'Construction terrasse',
          description: 'Construction d\'une terrasse extérieure en bois composite, 20m²',
          categorie: 'maconnerie',
          statut: 'en_negociation',
          budget_min: 1500000,
          budget_max: 1800000,
          localisation: 'Quartier Lafiabougou',
          ville: 'Bobo-Dioulasso',
          date_souhaitee: new Date(Date.now() + 2592000000).toISOString().split('T')[0],
          date_limite_devis: new Date(Date.now() + 864000000).toISOString().split('T')[0],
          images_url: [],
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'demo-3',
          client_id: 'demo',
          titre: 'Installation électrique',
          description: 'Installation électrique complète pour nouvelle construction',
          categorie: 'electricite',
          statut: 'en_cours',
          budget_min: 3000000,
          budget_max: 3200000,
          localisation: 'Ouaga 2000',
          ville: 'Ouagadougou',
          date_souhaitee: new Date(Date.now() + 1814400000).toISOString().split('T')[0],
          date_limite_devis: new Date(Date.now() + 604800000).toISOString().split('T')[0],
          images_url: [],
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
      setQuotes([
        {
          id: 'quote-1',
          job_request_id: 'demo-2',
          artisan_id: 'artisan-1',
          montant_total: 1750000,
          montant_acompte: 525000,
          delai_execution: 21,
          description_travaux: 'Devis détaillé pour la construction de terrasse en bois composite',
          materiel_fourni: ['Bois composite', 'Visserie inox', 'Structure aluminium'],
          conditions_paiement: '30% à la commande, 40% à mi-parcours, 30% à la livraison',
          statut: 'soumis',
          validite_jusqu_au: new Date(Date.now() + 2592000000).toISOString().split('T')[0],
          created_at: new Date(Date.now() - 43200000).toISOString(),
          updated_at: new Date(Date.now() - 43200000).toISOString(),
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_requests')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;
      setJobRequests(jobsData || []);

      if (jobsData && jobsData.length > 0) {
        const { data: quotesData, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .in('job_request_id', jobsData.map(j => j.id))
          .order('created_at', { ascending: false });

        if (quotesError) throw quotesError;
        setQuotes(quotesData || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'publiee':
        return 'bg-blue-100 text-blue-800';
      case 'en_negociation':
        return 'bg-yellow-100 text-yellow-800';
      case 'attribuee':
        return 'bg-green-100 text-green-800';
      case 'en_cours':
        return 'bg-purple-100 text-purple-800';
      case 'terminee':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      publiee: 'Publiée',
      en_negociation: 'En négociation',
      attribuee: 'Attribuée',
      en_cours: 'En cours',
      terminee: 'Terminée',
      annulee: 'Annulée',
    };
    return labels[status] || status;
  };

  const stats = {
    total: jobRequests.length,
    actives: jobRequests.filter(j => ['publiee', 'en_negociation', 'en_cours'].includes(j.statut)).length,
    terminees: jobRequests.filter(j => j.statut === 'terminee').length,
    devisRecus: quotes.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Demandes</h1>
            <p className="text-sm text-gray-600">Gérez vos projets de rénovation</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateJob(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvelle demande
            </button>
            <button
              onClick={onLogout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Demandes totales</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">En cours</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.actives}</p>
              </div>
              <Clock className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Terminées</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.terminees}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Devis reçus</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.devisRecus}</p>
              </div>
              <FileText className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap gap-0">
              <button
                onClick={() => setActiveTab('demandes')}
                className={`flex-1 sm:flex-none px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'demandes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Mes demandes ({stats.total})
              </button>
              <button
                onClick={() => setActiveTab('devis')}
                className={`flex-1 sm:flex-none px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'devis'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Devis reçus ({stats.devisRecus})
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 sm:flex-none px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'stats'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Statistiques
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : activeTab === 'demandes' ? (
              jobRequests.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-6">Aucune demande créée</p>
                  <button
                    onClick={() => setShowCreateJob(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Créer ma première demande
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobRequests.map(job => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{job.titre}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.statut)}`}>
                              {getStatusLabel(job.statut)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span>📍 {job.localisation}</span>
                            <span>💰 {job.budget_min.toLocaleString()} - {job.budget_max.toLocaleString()} FCFA</span>
                            <span>📅 {new Date(job.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            {quotes.filter(q => q.job_request_id === job.id).length}
                          </p>
                          <p className="text-xs text-gray-600">devis</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : activeTab === 'devis' ? (
              quotes.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p>Aucun devis reçu pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quotes.map(quote => {
                    const job = jobRequests.find(j => j.id === quote.job_request_id);
                    return (
                      <div key={quote.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{job?.titre}</h3>
                            <p className="text-gray-600 text-sm mb-3">{quote.description_travaux.substring(0, 100)}...</p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span>⏱️ {quote.delai_execution} jours</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                quote.statut === 'accepte' ? 'bg-green-100 text-green-800' :
                                quote.statut === 'refuse' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {quote.statut}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                              {quote.montant_total.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">FCFA</p>
                            <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                              Voir détails
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Activité</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Demandes créées</span>
                      <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Devis reçus</span>
                      <span className="text-2xl font-bold text-purple-600">{stats.devisRecus}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Taux de conversion</span>
                      <span className="text-2xl font-bold text-green-600">
                        {stats.total > 0 ? Math.round((stats.devisRecus / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Performance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Projets actifs</span>
                      <span className="text-2xl font-bold text-green-600">{stats.actives}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Complétés</span>
                      <span className="text-2xl font-bold text-emerald-600">{stats.terminees}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Taux de réussite</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {stats.total > 0 ? Math.round((stats.terminees / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showCreateJob && (
        <JobRequestForm
          clientId={userId}
          onSuccess={() => {
            setShowCreateJob(false);
            loadData();
          }}
          onCancel={() => setShowCreateJob(false)}
        />
      )}
    </div>
  );
}
