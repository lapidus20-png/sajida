import { Star, Phone, MapPin, Briefcase, Navigation } from 'lucide-react';
import { Artisan } from '../lib/supabase';
import { calculateDistance, formatDistance, getDistanceColor } from '../lib/distanceUtils';

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
          <span className={`absolute bottom-3 left-3 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-semibold border ${getDistanceColor(distance)}`}>
            <Navigation className="w-3.5 h-3.5" />
            {formatDistance(distance)}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {artisan.prenom} {artisan.nom}
        </h3>

        <div className="flex flex-wrap gap-1 mb-2">
          {(() => {
            const metiers = Array.isArray(artisan.metier) ? artisan.metier : [artisan.metier];
            return metiers && metiers.length > 0 && metiers[0] ? (
              metiers.map((m, idx) => (
                <span key={idx} className="text-amber-600 font-semibold">
                  {m}{idx < metiers.length - 1 && ', '}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">Métier non spécifié</span>
            );
          })()}
        </div>

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
