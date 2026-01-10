import { useState } from 'react';
import { Map, Navigation, X } from 'lucide-react';
import GoogleMapPicker from './GoogleMapPicker';
import LocationPicker from './LocationPicker';

interface UnifiedLocationPickerProps {
  onLocationSelect: (latitude: number, longitude: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  onClose?: () => void;
}

export default function UnifiedLocationPicker({
  onLocationSelect,
  initialLat,
  initialLng,
  onClose,
}: UnifiedLocationPickerProps) {
  const [selectedMethod, setSelectedMethod] = useState<'choose' | 'google' | 'simple'>('choose');

  if (selectedMethod === 'google') {
    return (
      <GoogleMapPicker
        onLocationSelect={onLocationSelect}
        initialLat={initialLat}
        initialLng={initialLng}
        onClose={onClose}
      />
    );
  }

  if (selectedMethod === 'simple') {
    return (
      <LocationPicker
        onLocationSelect={onLocationSelect}
        initialLat={initialLat}
        initialLng={initialLng}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold">Choisir une méthode de localisation</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="hover:bg-white hover:bg-opacity-20 p-1 rounded"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-center mb-6">
            Sélectionnez la méthode que vous préférez pour définir votre position
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedMethod('google')}
              className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-300 rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Map className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Carte interactive
                </h3>
                <p className="text-sm text-gray-600">
                  Utilisez Google Maps pour sélectionner visuellement votre position sur une carte
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-semibold">
                    ✓ Très précis
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-semibold ml-2">
                    ✓ Visuel
                  </span>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod('simple')}
              className="group bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 border-2 border-green-300 rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Navigation className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Géolocalisation simple
                </h3>
                <p className="text-sm text-gray-600">
                  Utilisez votre GPS ou saisissez manuellement vos coordonnées
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold">
                    ✓ Rapide
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold ml-2">
                    ✓ Simple
                  </span>
                </div>
              </div>
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-gray-900 mb-2">Quelle méthode choisir?</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Carte interactive:</strong> Idéale pour une précision maximale et voir l'environnement autour</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Géolocalisation simple:</strong> Plus rapide, parfaite si vous connaissez déjà vos coordonnées</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
          {onClose && (
            <button
              onClick={onClose}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
