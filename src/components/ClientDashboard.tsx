import { useState, useEffect } from 'react';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, MessageSquare, Eye, Edit2, FolderOpen } from 'lucide-react';
import { supabase, JobRequest, Quote } from '../lib/supabase';
import JobRequestForm from './JobRequestForm';
import DocumentGallery from './DocumentGallery';

interface ClientDashboardProps {
  userId: string;
  onLogout: () => void;
}

export default function ClientDashboard({ userId, onLogout }: ClientDashboardProps) {
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [activeTab, setActiveTab] = useState<'demandes' | 'devis' | 'documents' | 'stats'>('demandes');
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
          budget: 2000000,
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
          budget: 1500000,
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
          budget: 3000000,
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
          statut: 'en_attente',
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
        .select('id, client_id, titre, description, categorie, statut, budget, ville, date_souhaitee, created_at')
        .eq('client_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (jobsError) throw jobsError;
      setJobRequests(jobsData || []);
      setLoading(false);

      if (jobsData && jobsData.length > 0) {
        const jobIds = jobsData.map(j => j.id);

        const { data: quotesData, error: quotesError } = await supabase
          .from('quotes')
          .select('id, job_request_id, artisan_id, montant_total, montant_acompte, delai_execution, description_travaux, materiel_fourni, conditions_paiement, statut, validite_jusqu_au, created_at, updated_at')
          .in('job_request_id', jobIds)
          .order('created_at', { ascending: false })
          .limit(100);

        if (quotesError) throw quotesError;
        setQuotes(quotesData || []);
      } else {
        setQuotes([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-green-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 burkina-gradient burkina-star rounded"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes Demandes</h1>
              <p className="text-sm text-gray-600">Gérez vos projets de rénovation</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                console.log('Button clicked!');
                setShowCreateJob(true);
                console.log('showCreateJob set to true');
              }}
              className="bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
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
                    ? 'border-red-600 text-red-600'
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
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Devis reçus ({stats.devisRecus})
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex-1 sm:flex-none px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'documents'
                    ? 'border-yellow-600 text-yellow-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <FolderOpen className="w-4 h-4 inline mr-2" />
                Mes Documents
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 sm:flex-none px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'stats'
                    ? 'border-green-600 text-green-600'
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
                            <span>💰 {job.budget.toLocaleString()} FCFA</span>
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
                <div className="space-y-6">
                  {quotes.map(quote => {
                    const job = jobRequests.find(j => j.id === quote.job_request_id);
                    return (
                      <div key={quote.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 border-b border-gray-200">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg mb-1">{job?.titre}</h3>
                              <p className="text-sm text-gray-600">Reçu le {new Date(quote.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              quote.statut === 'accepte' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                              quote.statut === 'refuse' ? 'bg-red-100 text-red-800 border-2 border-red-300' :
                              quote.statut === 'expire' ? 'bg-gray-100 text-gray-800 border-2 border-gray-300' :
                              'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                            }`}>
                              {quote.statut === 'en_attente' ? '⏳ En attente' :
                               quote.statut === 'accepte' ? '✓ Accepté' :
                               quote.statut === 'refuse' ? '✗ Refusé' :
                               '⌛ Expiré'}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Détails du devis
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Montant total:</span>
                                  <span className="font-bold text-blue-600 text-lg">{quote.montant_total.toLocaleString()} FCFA</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Acompte:</span>
                                  <span className="font-semibold text-gray-900">{quote.montant_acompte.toLocaleString()} FCFA</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Délai d'exécution:</span>
                                  <span className="font-semibold text-gray-900">{quote.delai_execution} jours</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Valide jusqu'au:</span>
                                  <span className="font-semibold text-gray-900">
                                    {new Date(quote.validite_jusqu_au).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Description des travaux</h4>
                              <p className="text-sm text-gray-700 leading-relaxed">{quote.description_travaux}</p>
                            </div>
                          </div>

                          {quote.materiel_fourni && quote.materiel_fourni.length > 0 && (
                            <div className="mb-6">
                              <h4 className="font-semibold text-gray-900 mb-3">Matériel fourni</h4>
                              <div className="flex flex-wrap gap-2">
                                {quote.materiel_fourni.map((item, idx) => (
                                  <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    ✓ {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {quote.conditions_paiement && (
                            <div className="mb-6">
                              <h4 className="font-semibold text-gray-900 mb-3">Conditions de paiement</h4>
                              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                {quote.conditions_paiement}
                              </p>
                            </div>
                          )}

                          {quote.statut === 'en_attente' && (
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                              <button
                                onClick={async () => {
                                  try {
                                    const { error } = await supabase
                                      .from('quotes')
                                      .update({ statut: 'accepte' })
                                      .eq('id', quote.id);

                                    if (error) throw error;
                                    await loadData();
                                  } catch (err) {
                                    console.error('Erreur lors de l\'acceptation du devis:', err);
                                  }
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                              >
                                <CheckCircle className="w-5 h-5" />
                                Accepter ce devis
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('Êtes-vous sûr de vouloir refuser ce devis ?')) {
                                    try {
                                      const { error } = await supabase
                                        .from('quotes')
                                        .update({ statut: 'refuse' })
                                        .eq('id', quote.id);

                                      if (error) throw error;
                                      await loadData();
                                    } catch (err) {
                                      console.error('Erreur lors du refus du devis:', err);
                                    }
                                  }
                                }}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                              >
                                <AlertCircle className="w-5 h-5" />
                                Refuser ce devis
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : activeTab === 'documents' ? (
              <DocumentGallery userId={userId} />
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
