import { Star, Phone, MapPin, Briefcase, Navigation } from 'lucide-react';
import { Artisan, calculateDistance } from '../lib/supabase';

interface ArtisanCardProps {
  artisan: Artisan;
  onContact: (artisan: Artisan) => void;
  userLat?: number;
  userLng?: number;
}

export default function ArtisanCard({ artisan, onContact, userLat, userLng }: ArtisanCardProps) {
  const distance =
    userLat && userLng && artisan.latitude && artisan.longitude
      ? calculateDistance(userLat, userLng, artisan.latitude, artisan.longitude)
      : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gradient-to-br from-amber-400 to-orange-500">
        {artisan.photo_url ? (
          <img src={artisan.photo_url} alt={`${artisan.prenom} ${artisan.nom}`} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Briefcase className="w-16 h-16 text-white opacity-80" />
          </div>
        )}
        {artisan.disponible && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Disponible
          </span>
        )}
        {distance !== null && (
          <span className="absolute bottom-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
            <Navigation className="w-3 h-3" />
            {distance} km
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {artisan.prenom} {artisan.nom}
        </h3>

        <p className="text-amber-600 font-semibold mb-2">{artisan.metier}</p>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{artisan.note_moyenne.toFixed(1)}</span>
          <span className="text-sm text-gray-500 ml-1">
            • {artisan.annees_experience} ans d'expérience
          </span>
        </div>

        {artisan.ville && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{artisan.ville}{artisan.quartier && `, ${artisan.quartier}`}</span>
          </div>
        )}

        {artisan.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {artisan.description}
          </p>
        )}

        {artisan.tarif_horaire > 0 && (
          <p className="text-lg font-bold text-gray-900 mb-4">
            {artisan.tarif_horaire.toLocaleString()} FCFA/h
          </p>
        )}

        <button
          onClick={() => onContact(artisan)}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Contacter
        </button>
      </div>
    </div>
  );
}
