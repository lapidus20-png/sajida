import { useState } from 'react';
import { AlertCircle, Plus, X, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import GoogleMapPicker from './GoogleMapPicker';

interface JobRequestFormProps {
  clientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'Plomberie',
  'Électricité',
  'Peinture',
  'Menuiserie',
  'Maçonnerie',
  'Chauffage',
  'Isolation',
  'Toiture',
  'Carrelage',
  'Vitrage',
  'Jardinage',
  'Autre',
];

export default function JobRequestForm({ clientId, onSuccess, onCancel }: JobRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    categorie: '',
    localisation: '',
    ville: '',
    budget: '',
    date_souhaitee: '',
    date_limite_devis: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddImage = (url: string) => {
    if (url && !images.includes(url)) {
      setImages([...images, url]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('job_requests')
        .insert({
          client_id: clientId,
          titre: formData.titre,
          description: formData.description,
          categorie: formData.categorie,
          localisation: formData.localisation,
          ville: formData.ville,
          budget: parseInt(formData.budget) || 0,
          date_souhaitee: formData.date_souhaitee || null,
          date_limite_devis: formData.date_limite_devis || null,
          images_url: images,
          latitude: location?.lat || null,
          longitude: location?.lng || null,
          statut: 'publiee',
        });

      if (insertError) throw new Error(insertError.message);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white flex items-center justify-between">
          <h2 className="text-2xl font-bold">Créer une demande de travaux</h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre du projet</label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Réparation de plomberie urgente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select
                name="categorie"
                value={formData.categorie}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une catégorie</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description détaillée</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Décrivez les travaux en détail, ce qui a été fait, vos attentes..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
              <input
                type="text"
                name="localisation"
                value={formData.localisation}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Secteur, quartier, adresse"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ouagadougou, Bobo-Dioulasso..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget du projet (FCFA)</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 500000"
            />
            <p className="text-xs text-gray-500 mt-2">
              Visible uniquement par vous. Les artisans sélectionnés devront débourser 25% de ce montant pour accéder à vos coordonnées.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date souhaitée</label>
              <input
                type="date"
                name="date_souhaitee"
                value={formData.date_souhaitee}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Limite pour les devis</label>
              <input
                type="date"
                name="date_limite_devis"
                value={formData.date_limite_devis}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Localisation précise (optionnel)
            </label>
            <button
              type="button"
              onClick={() => setShowLocationPicker(true)}
              className="w-full bg-green-50 hover:bg-green-100 border-2 border-green-300 text-green-700 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <MapPin className="w-5 h-5" />
              {location ? `Position: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Définir la position du chantier'}
            </button>
            {location && (
              <p className="text-xs text-green-700 mt-2 font-medium">✓ Les artisans verront la distance depuis chez eux</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos/Pièces jointes</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                id="image-input"
                placeholder="URL de l'image"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('image-input') as HTMLInputElement;
                  if (input?.value) {
                    handleAddImage(input.value);
                    input.value = '';
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Ajouter
              </button>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Création en cours...' : 'Publier ma demande'}
            </button>
          </div>
        </form>
      </div>

      {showLocationPicker && (
        <GoogleMapPicker
          initialLat={location?.lat}
          initialLng={location?.lng}
          onLocationSelect={(lat, lng, address) => {
            setLocation({ lat, lng, address });
            setShowLocationPicker(false);
          }}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  );
}
