import { useState, useEffect } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (latitude: number, longitude: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  onClose?: () => void;
}

export default function LocationPicker({
  onLocationSelect,
  initialLat,
  initialLng,
  onClose,
}: LocationPickerProps) {
  const [latitude, setLatitude] = useState(initialLat || 12.3714);
  const [longitude, setLongitude] = useState(initialLng || -1.5197);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialLat && initialLng) {
      setLatitude(initialLat);
      setLongitude(initialLng);
      reverseGeocode(initialLat, initialLng);
    }
  }, [initialLat, initialLng]);

  const getCurrentLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        reverseGeocode(lat, lng);
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Impossible d\'obtenir votre position';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Accès à la localisation refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Position indisponible. Vérifiez votre connexion GPS/WiFi.";
            break;
          case error.TIMEOUT:
            errorMessage = "Délai d'attente dépassé. Veuillez réessayer.";
            break;
        }

        setError(errorMessage + ' Veuillez entrer manuellement.');
        setLoading(false);
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      setAddress(data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch (err) {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const handleManualInput = () => {
    if (latitude && longitude) {
      reverseGeocode(latitude, longitude);
    }
  };

  const handleConfirm = () => {
    if (latitude && longitude) {
      onLocationSelect(latitude, longitude, address);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Sélectionner la localisation
          </h2>
          {onClose && (
            <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-1 rounded">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-8 h-8 text-green-600" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Position actuelle</p>
                <p className="text-sm text-gray-600">{address || 'Aucune adresse sélectionnée'}</p>
              </div>
            </div>

            <button
              onClick={getCurrentLocation}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Navigation className="w-5 h-5" />
              {loading ? 'Obtention de la position...' : 'Utiliser ma position actuelle'}
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">Ou entrez les coordonnées manuellement:</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  onBlur={handleManualInput}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="12.3714"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  onBlur={handleManualInput}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="-1.5197"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Astuce:</strong> Pour Ouagadougou, les coordonnées sont environ: 12.3714, -1.5197
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Vous pouvez aussi utiliser Google Maps pour trouver vos coordonnées exactes.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Aperçu de la carte</h3>
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-600">
                <MapPin className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">
                  {latitude && longitude ? (
                    <>
                      <span className="font-semibold">Position:</span><br />
                      {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </>
                  ) : (
                    'Sélectionnez une position'
                  )}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                >
                  Voir sur Google Maps →
                </a>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            )}
            <button
              onClick={handleConfirm}
              disabled={!latitude || !longitude}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
            >
              Confirmer la position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
