import { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, Phone, Mail, MapPin, Star, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Quote {
  id: string;
  artisan_id: string;
  montant_total: number;
  montant_acompte: number;
  delai_execution: number;
  description_travaux: string;
  materiel_fourni: string[];
  conditions_paiement: string;
  statut: string;
  created_at: string;
}

interface Artisan {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  ville: string;
  quartier: string;
  metier: string[];
  annees_experience: number;
  photo_url: string | null;
}

interface QuoteWithArtisan extends Quote {
  artisan: Artisan;
}

interface SelectArtisanModalProps {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
  onSelect: (artisanId: string, quoteId: string) => void;
}

export default function SelectArtisanModal({
  jobId,
  jobTitle,
  onClose,
  onSelect,
}: SelectArtisanModalProps) {
  const [quotes, setQuotes] = useState<QuoteWithArtisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadQuotes();
  }, [jobId]);

  const loadQuotes = async () => {
    try {
      setLoading(true);

      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*')
        .eq('job_request_id', jobId)
        .order('created_at', { ascending: false });

      if (quotesError) throw quotesError;

      if (quotesData && quotesData.length > 0) {
        const artisanIds = quotesData.map(q => q.artisan_id);

        const { data: artisansData, error: artisansError } = await supabase
          .from('artisans')
          .select('id, nom, prenom, telephone, ville, quartier, metier, annees_experience, photo_url')
          .in('id', artisanIds);

        if (artisansError) throw artisansError;

        const quotesWithArtisans = quotesData.map(quote => {
          const artisan = artisansData.find(a => a.id === quote.artisan_id)!;

          let metierArray: string[] = [];
          if (artisan.metier) {
            if (Array.isArray(artisan.metier)) {
              metierArray = artisan.metier;
            } else if (typeof artisan.metier === 'string') {
              try {
                metierArray = JSON.parse(artisan.metier);
              } catch {
                metierArray = [artisan.metier];
              }
            }
          }

          return {
            ...quote,
            artisan: {
              ...artisan,
              metier: metierArray,
            },
          };
        });

        setQuotes(quotesWithArtisans);
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuoteSelection = (quoteId: string) => {
    setSelectedQuoteIds(prev => {
      if (prev.includes(quoteId)) {
        return prev.filter(id => id !== quoteId);
      } else if (prev.length < 3) {
        return [...prev, quoteId];
      }
      return prev;
    });
  };

  const handleSelectArtisans = async () => {
    if (selectedQuoteIds.length === 0) return;

    try {
      setSaving(true);

      for (let i = 0; i < selectedQuoteIds.length; i++) {
        const quoteId = selectedQuoteIds[i];
        const selectedQuote = quotes.find(q => q.id === quoteId);
        if (!selectedQuote) continue;

        const { error } = await supabase
          .from('job_artisan_selections')
          .insert({
            job_request_id: jobId,
            artisan_id: selectedQuote.artisan_id,
            quote_id: quoteId,
            selection_order: i + 1,
          });

        if (error) {
          console.error('Error selecting artisan:', error);
          throw error;
        }
      }

      onSelect(quotes.find(q => q.id === selectedQuoteIds[0])!.artisan_id, selectedQuoteIds[0]);
    } catch (error) {
      console.error('Error selecting artisans:', error);
      alert('Une erreur est survenue lors de la sélection des artisans');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_attente':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">En attente</span>;
      case 'accepte':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Accepté</span>;
      case 'refuse':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Refusé</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Sélectionner un artisan</h2>
            <p className="text-blue-100 text-sm mt-1">{jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun artisan n'a postulé pour ce projet</p>
              <p className="text-sm text-gray-500 mt-2">Les artisans intéressés apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <strong className="font-semibold">{quotes.length} artisan{quotes.length > 1 ? 's ont postulé' : ' a postulé'}</strong> pour votre projet.
                  Vous pouvez sélectionner jusqu'à 3 artisans. {selectedQuoteIds.length > 0 && `(${selectedQuoteIds.length}/3 sélectionné${selectedQuoteIds.length > 1 ? 's' : ''})`}
                </p>
              </div>

              {quotes.map((quote) => {
                const isSelected = selectedQuoteIds.includes(quote.id);
                const selectionIndex = selectedQuoteIds.indexOf(quote.id);
                const selectionLabels = ['1er choix', '2e choix', '3e choix'];

                return (
                <div
                  key={quote.id}
                  onClick={() => toggleQuoteSelection(quote.id)}
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : selectedQuoteIds.length >= 3
                      ? 'border-gray-200 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {quote.artisan.photo_url ? (
                        <img
                          src={quote.artisan.photo_url}
                          alt={`${quote.artisan.prenom} ${quote.artisan.nom}`}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xl font-bold">
                          {quote.artisan.prenom[0]}{quote.artisan.nom[0]}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {quote.artisan.prenom} {quote.artisan.nom}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Array.isArray(quote.artisan.metier) && quote.artisan.metier.length > 0 ? (
                              quote.artisan.metier.slice(0, 3).map((m, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                                  {m}
                                </span>
                              ))
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                Artisan
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          {getStatusBadge(quote.statut)}
                          {isSelected && (
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                                {selectionLabels[selectionIndex]}
                              </span>
                              <CheckCircle className="w-6 h-6 text-blue-600" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Award className="w-4 h-4 text-amber-600" />
                          <span>{quote.artisan.annees_experience} ans d'expérience</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>{quote.artisan.quartier}, {quote.artisan.ville}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-medium text-gray-700">Montant total:</span>
                          <span className="text-xl font-bold text-green-600">
                            {quote.montant_total.toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between text-sm">
                          <span className="text-gray-700">Acompte:</span>
                          <span className="font-semibold text-gray-900">
                            {quote.montant_acompte.toLocaleString()} FCFA
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between text-sm">
                          <span className="text-gray-700">Délai d'exécution:</span>
                          <span className="font-semibold text-gray-900">
                            {quote.delai_execution} jours
                          </span>
                        </div>
                      </div>

                      {quote.description_travaux && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Description des travaux:</p>
                          <p className="text-sm text-gray-600">{quote.description_travaux}</p>
                        </div>
                      )}

                      {quote.materiel_fourni && quote.materiel_fourni.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Matériel fourni:</p>
                          <div className="flex flex-wrap gap-1">
                            {quote.materiel_fourni.map((item, idx) => (
                              <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {quote.conditions_paiement && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Conditions de paiement:</p>
                          <p className="text-sm text-gray-600">{quote.conditions_paiement}</p>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
                        <span>Posté le {new Date(quote.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          {quotes.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSelectArtisans}
                disabled={selectedQuoteIds.length === 0 || saving}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sélection en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Sélectionner {selectedQuoteIds.length > 1 ? `ces ${selectedQuoteIds.length} artisans` : 'cet artisan'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
