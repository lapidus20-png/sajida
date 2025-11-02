import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Plus, Upload } from 'lucide-react';
import { supabase, Contract, ProjectTimeline } from '../lib/supabase';

interface ProjectTrackingProps {
  contract: Contract;
  onClose: () => void;
}

export default function ProjectTracking({ contract, onClose }: ProjectTrackingProps) {
  const [timelines, setTimelines] = useState<ProjectTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddJalon, setShowAddJalon] = useState(false);
  const [newJalon, setNewJalon] = useState({
    titre: '',
    description: '',
    date_prevue: '',
    montant_associe: '',
    pourcentage_travail: '',
  });

  useEffect(() => {
    loadTimelines();
  }, [contract.id]);

  const loadTimelines = async () => {
    try {
      const { data, error } = await supabase
        .from('project_timeline')
        .select('*')
        .eq('contract_id', contract.id)
        .order('jalon_numero', { ascending: true });

      if (error) throw error;
      setTimelines(data || []);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJalon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nextNumber = (timelines.length || 0) + 1;
      const { error } = await supabase
        .from('project_timeline')
        .insert({
          contract_id: contract.id,
          jalon_numero: nextNumber,
          titre: newJalon.titre,
          description: newJalon.description,
          date_prevue: newJalon.date_prevue,
          montant_associe: parseInt(newJalon.montant_associe) || 0,
          pourcentage_travail: parseInt(newJalon.pourcentage_travail) || 0,
          statut: 'en_attente',
        });

      if (error) throw error;
      loadTimelines();
      setShowAddJalon(false);
      setNewJalon({
        titre: '',
        description: '',
        date_prevue: '',
        montant_associe: '',
        pourcentage_travail: '',
      });
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const updateJalonStatus = async (jalonId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('project_timeline')
        .update({ statut: newStatus })
        .eq('id', jalonId);

      if (error) throw error;
      loadTimelines();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'en_cours':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'repousse':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'complete') return <CheckCircle className="w-5 h-5" />;
    if (status === 'en_cours') return <Clock className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  const totalProgress = timelines.length > 0
    ? Math.round(timelines.reduce((sum, t) => sum + t.pourcentage_travail, 0) / timelines.length)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl my-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Suivi du projet</h2>
            <p className="text-purple-100">Contrat #{contract.id.slice(0, 8)}</p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progression globale</span>
                <span className="text-lg font-bold text-purple-600">{totalProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{contract.montant_total.toLocaleString()}</p>
                <p className="text-xs text-gray-600">Montant total</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{contract.acompte.toLocaleString()}</p>
                <p className="text-xs text-gray-600">Acompte</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{contract.reste_du.toLocaleString()}</p>
                <p className="text-xs text-gray-600">Reste à payer</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{timelines.filter(t => t.statut === 'complete').length}/{timelines.length}</p>
                <p className="text-xs text-gray-600">Jalons complétés</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Jalons du projet</h3>
              <button
                onClick={() => setShowAddJalon(!showAddJalon)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter un jalon
              </button>
            </div>

            {showAddJalon && (
              <form onSubmit={handleAddJalon} className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Titre du jalon"
                    value={newJalon.titre}
                    onChange={(e) => setNewJalon({ ...newJalon, titre: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Description"
                    value={newJalon.description}
                    onChange={(e) => setNewJalon({ ...newJalon, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={newJalon.date_prevue}
                    onChange={(e) => setNewJalon({ ...newJalon, date_prevue: e.target.value })}
                    required
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="% travail"
                    value={newJalon.pourcentage_travail}
                    onChange={(e) => setNewJalon({ ...newJalon, pourcentage_travail: e.target.value })}
                    min="0"
                    max="100"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    Ajouter
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddJalon(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : timelines.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                Aucun jalon défini. Créez un jalon pour commencer.
              </div>
            ) : (
              <div className="space-y-3">
                {timelines.map((jalon) => (
                  <div key={jalon.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getStatusIcon(jalon.statut)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900">
                            Jalon {jalon.jalon_numero}: {jalon.titre}
                          </h4>
                          <select
                            value={jalon.statut}
                            onChange={(e) => updateJalonStatus(jalon.id, e.target.value)}
                            className={`text-sm px-3 py-1 rounded-full border-2 font-medium cursor-pointer ${getStatusColor(jalon.statut)}`}
                          >
                            <option value="en_attente">En attente</option>
                            <option value="en_cours">En cours</option>
                            <option value="complete">Complété</option>
                            <option value="repousse">Repoussé</option>
                          </select>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{jalon.description}</p>
                        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                          <div className="flex gap-4 text-xs">
                            <span className="text-gray-600">📅 {new Date(jalon.date_prevue).toLocaleDateString('fr-FR')}</span>
                            <span className="text-gray-600">💰 {jalon.montant_associe.toLocaleString()} FCFA</span>
                          </div>
                          <div className="w-32">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-600">{jalon.pourcentage_travail}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                style={{ width: `${jalon.pourcentage_travail}%` }}
                              />
                            </div>
                          </div>
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
    </div>
  );
}
