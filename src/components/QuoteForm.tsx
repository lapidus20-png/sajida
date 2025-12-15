import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { supabase, JobRequest, Quote } from '../lib/supabase';

interface QuoteFormProps {
  jobRequest: JobRequest;
  artisanId: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingQuote?: Quote | null;
}

export default function QuoteForm({ jobRequest, artisanId, onSuccess, onCancel, existingQuote }: QuoteFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [materiel, setMateriel] = useState<string[]>(existingQuote?.materiel_fourni || []);
  const [formData, setFormData] = useState({
    montant_total: existingQuote?.montant_total?.toString() || '',
    montant_acompte: existingQuote?.montant_acompte?.toString() || '',
    delai_execution: existingQuote?.delai_execution?.toString() || '',
    description_travaux: existingQuote?.description_travaux || '',
    conditions_paiement: existingQuote?.conditions_paiement || '',
    validite_jusqu_au: existingQuote?.validite_jusqu_au || '',
  });

  useEffect(() => {
    if (existingQuote) {
      setMateriel(existingQuote.materiel_fourni || []);
      setFormData({
        montant_total: existingQuote.montant_total?.toString() || '',
        montant_acompte: existingQuote.montant_acompte?.toString() || '',
        delai_execution: existingQuote.delai_execution?.toString() || '',
        description_travaux: existingQuote.description_travaux || '',
        conditions_paiement: existingQuote.conditions_paiement || '',
        validite_jusqu_au: existingQuote.validite_jusqu_au || '',
      });
    }
  }, [existingQuote]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMateriel = (item: string) => {
    if (item && !materiel.includes(item)) {
      setMateriel([...materiel, item]);
    }
  };

  const handleRemoveMateriel = (index: number) => {
    setMateriel(materiel.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const quoteData = {
        job_request_id: jobRequest.id,
        artisan_id: artisanId,
        montant_total: parseInt(formData.montant_total) || 0,
        montant_acompte: parseInt(formData.montant_acompte) || 0,
        delai_execution: parseInt(formData.delai_execution) || 0,
        description_travaux: formData.description_travaux,
        materiel_fourni: materiel,
        conditions_paiement: formData.conditions_paiement,
        validite_jusqu_au: formData.validite_jusqu_au || null,
        statut: 'en_attente',
      };

      if (existingQuote) {
        const { error: updateError } = await supabase
          .from('quotes')
          .update(quoteData)
          .eq('id', existingQuote.id);

        if (updateError) throw new Error(updateError.message);
      } else {
        const { error: insertError } = await supabase
          .from('quotes')
          .insert(quoteData);

        if (insertError) throw new Error(insertError.message);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Erreur lors de ${existingQuote ? 'la modification' : 'la création'} du devis`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white flex items-center justify-between">
          <h2 className="text-2xl font-bold">{existingQuote ? 'Modifier le devis' : 'Créer un devis'}</h2>
          <button onClick={onCancel} className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-gray-700">
              <span className="font-bold text-gray-900">{jobRequest.titre}</span>
              <br />
              <span className="text-gray-600">{jobRequest.description.substring(0, 100)}...</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description des travaux</label>
            <textarea
              name="description_travaux"
              value={formData.description_travaux}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Décrivez précisément les travaux que vous allez effectuer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Montant total (FCFA)</label>
              <input
                type="number"
                name="montant_total"
                value={formData.montant_total}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Montant acompte (FCFA)</label>
              <input
                type="number"
                name="montant_acompte"
                value={formData.montant_acompte}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Délai d'exécution (jours)</label>
            <input
              type="number"
              name="delai_execution"
              value={formData.delai_execution}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Nombre de jours"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Matériel fourni</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                id="materiel-input"
                placeholder="Ex: Carreaux, mortier, ciment"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('materiel-input') as HTMLInputElement;
                  if (input?.value) {
                    handleAddMateriel(input.value);
                    input.value = '';
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Ajouter
              </button>
            </div>

            {materiel.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {materiel.map((item, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveMateriel(index)}
                      className="hover:text-green-900 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Conditions de paiement</label>
            <textarea
              name="conditions_paiement"
              value={formData.conditions_paiement}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: 50% à la signature, 50% à la fin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Validité du devis</label>
            <input
              type="date"
              name="validite_jusqu_au"
              value={formData.validite_jusqu_au}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? (existingQuote ? 'Modification...' : 'Envoi en cours...') : (existingQuote ? 'Modifier le devis' : 'Envoyer le devis')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
