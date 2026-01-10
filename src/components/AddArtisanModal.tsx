import { X, Briefcase, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import UnifiedLocationPicker from './UnifiedLocationPicker';
import FileUpload from './FileUpload';
import { UploadResult } from '../lib/storageService';
import { JOB_CATEGORY_GROUPS } from '../lib/jobCategories';

interface AddArtisanModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const VILLES = [
  'Ouagadougou',
  'Bobo-Dioulasso',
  'Koudougou',
  'Ouahigouya',
  'Banfora',
  'Dédougou',
  'Kaya',
  'Fada N\'Gourma',
  'Tenkodogo',
  'Houndé',
  'Réo',
  'Gaoua',
  'Dori',
  'Ziniaré',
  'Manga',
  'Bogandé',
  'Diébougou',
  'Yako',
  'Nouna',
  'Kongoussi',
  'Tougan',
  'Djibo',
  'Boulsa',
  'Boromo',
  'Titao',
  'Gorom-Gorom',
  'Léo',
  'Pô',
  'Orodara',
  'Gayéri',
  'Zabre',
  'Kombissiri',
  'Solenzo',
  'Sapouy',
  'Kokologo',
  'Garango',
  'Zorgho',
  'Batié',
  'Ouargaye',
  'Sindou',
  'Bittou',
  'Diapaga',
  'Niangoloko',
  'Kampti',
  'Ziniare',
  'Sabou',
  'Koupéla',
  'Pâ',
  'Toma',
  'Séguénéga',
  'Saaba'
];

export default function AddArtisanModal({ onClose, onSuccess }: AddArtisanModalProps) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    ville: '',
    quartier: '',
    metier: [] as string[],
    description: '',
    annees_experience: '',
    tarif_horaire: ''
  });
  const [selectedMetier, setSelectedMetier] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.metier.length === 0) {
      alert('Veuillez ajouter au moins un métier');
      return;
    }

    setLoading(true);

    try {
      const insertData: any = {
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        ville: formData.ville,
        quartier: formData.quartier,
        metier: formData.metier,
        description: formData.description,
        annees_experience: formData.annees_experience ? parseInt(formData.annees_experience) : 0,
        tarif_horaire: formData.tarif_horaire ? parseInt(formData.tarif_horaire) : 0,
        disponible: true,
        latitude: location?.lat || null,
        longitude: location?.lng || null,
        photo_url: photoUrl || null
      };

      if (currentUserId) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('id', currentUserId)
          .single();

        if (userData) {
          insertData.user_id = currentUserId;
        }
      }

      const { error } = await supabase.from('artisans').insert(insertData);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout de l\'artisan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Ajouter un profil artisan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: Amadou"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: Ouédraogo"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone *
              </label>
              <input
                type="tel"
                required
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ex: 70 12 34 56"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Métiers / Spécialités *
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={selectedMetier}
                    onChange={(e) => setSelectedMetier(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Sélectionnez un métier</option>
                    {JOB_CATEGORY_GROUPS.map(group => (
                      <optgroup key={group.name} label={`${group.icon} ${group.name}`}>
                        {group.categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedMetier && !formData.metier.includes(selectedMetier)) {
                        setFormData({ ...formData, metier: [...formData.metier, selectedMetier] });
                        setSelectedMetier('');
                      }
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-200 rounded-lg bg-gray-50">
                  {formData.metier.length > 0 ? (
                    formData.metier.map((m, idx) => (
                      <span key={idx} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {m}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, metier: formData.metier.filter(mt => mt !== m) })}
                          className="hover:text-amber-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">Aucun métier ajouté (requis)</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <select
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez une ville</option>
                  {VILLES.map(ville => (
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quartier
                </label>
                <input
                  type="text"
                  value={formData.quartier}
                  onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: Secteur 15"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description des services
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Décrivez vos compétences et services..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Années d'expérience
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.annees_experience}
                  onChange={(e) => setFormData({ ...formData, annees_experience: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarif horaire (FCFA)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.tarif_horaire}
                  onChange={(e) => setFormData({ ...formData, tarif_horaire: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: 2000"
                />
              </div>
            </div>

            {currentUserId && (
              <FileUpload
                bucketType="avatars"
                userId={currentUserId}
                label="Photo de profil (optionnel)"
                currentImageUrl={photoUrl || undefined}
                onUploadComplete={(result: UploadResult) => {
                  if (result.url) {
                    setPhotoUrl(result.url);
                  }
                }}
                onUploadError={(error) => {
                  console.error('Upload error:', error);
                }}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localisation GPS (optionnel)
              </label>
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="w-full bg-green-50 hover:bg-green-100 border-2 border-green-300 text-green-700 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                {location ? `Position: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Définir ma position'}
              </button>
              {location && (
                <p className="text-xs text-gray-600 mt-2">Permet aux clients de voir votre distance</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Ajout en cours...' : 'Ajouter l\'artisan'}
            </button>
          </form>
        </div>
      </div>

      {showLocationPicker && (
        <UnifiedLocationPicker
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
