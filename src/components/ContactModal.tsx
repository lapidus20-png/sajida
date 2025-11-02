import { X, Phone, Calendar, Lock, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Artisan, supabase, maskPhone, maskEmail, canViewContactInfo } from '../lib/supabase';

interface ContactModalProps {
  artisan: Artisan;
  onClose: () => void;
}

export default function ContactModal({ artisan, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    client_nom: '',
    client_telephone: '',
    description: '',
    adresse: '',
    date_souhaitee: '',
    budget_estime: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [canViewContacts, setCanViewContacts] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  useEffect(() => {
    checkContactPermissions();
  }, []);

  const checkContactPermissions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !artisan.user_id) {
      setCanViewContacts(false);
      setCheckingPermissions(false);
      return;
    }

    const canView = await canViewContactInfo(user.id, artisan.user_id);
    setCanViewContacts(canView);
    setCheckingPermissions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('services').insert({
        artisan_id: artisan.id,
        client_nom: formData.client_nom,
        client_telephone: formData.client_telephone,
        description: formData.description,
        adresse: formData.adresse,
        date_souhaitee: formData.date_souhaitee || null,
        budget_estime: formData.budget_estime ? parseInt(formData.budget_estime) : 0,
        statut: 'en_attente'
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Contacter {artisan.prenom} {artisan.nom}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Demande envoyée avec succès!
              </h3>
              <p className="text-gray-600">
                L'artisan vous contactera bientôt au {formData.client_telephone}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {checkingPermissions ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center">
                  <p className="text-sm text-gray-600">Vérification des permissions...</p>
                </div>
              ) : canViewContacts ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 space-y-2">
                  <p className="text-sm text-green-800">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Téléphone: <strong>{artisan.telephone}</strong>
                  </p>
                  {artisan.email && (
                    <p className="text-sm text-green-800">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email: <strong>{artisan.email}</strong>
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 font-medium mb-2">
                        Coordonnées protégées
                      </p>
                      <p className="text-sm text-blue-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Téléphone: <strong>{maskPhone(artisan.telephone)}</strong>
                      </p>
                      {artisan.email && (
                        <p className="text-sm text-blue-700 mb-3">
                          <Mail className="w-4 h-4 inline mr-1" />
                          Email: <strong>{maskEmail(artisan.email)}</strong>
                        </p>
                      )}
                      <p className="text-xs text-blue-600">
                        💡 Les coordonnées complètes seront visibles après le paiement de l'acompte
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.client_nom}
                  onChange={(e) => setFormData({ ...formData, client_nom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: Jean Ouédraogo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre numéro de téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.client_telephone}
                  onChange={(e) => setFormData({ ...formData, client_telephone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: 70 12 34 56"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du travail *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Décrivez le travail que vous souhaitez faire réaliser..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse du chantier
                </label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: Secteur 15, Ouagadougou"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date souhaitée
                  </label>
                  <input
                    type="date"
                    value={formData.date_souhaitee}
                    onChange={(e) => setFormData({ ...formData, date_souhaitee: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget estimé (FCFA)
                  </label>
                  <input
                    type="number"
                    value={formData.budget_estime}
                    onChange={(e) => setFormData({ ...formData, budget_estime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Ex: 50000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
