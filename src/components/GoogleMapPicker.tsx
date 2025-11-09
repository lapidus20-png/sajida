import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Loader } from 'lucide-react';
import { Loader as GoogleMapsLoader } from '@googlemaps/js-api-loader';

interface GoogleMapPickerProps {
  onLocationSelect: (latitude: number, longitude: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  onClose?: () => void;
}

export default function GoogleMapPicker({
  onLocationSelect,
  initialLat = 12.3714,
  initialLng = -1.5197,
  onClose,
}: GoogleMapPickerProps) {
  const [latitude, setLatitude] = useState(initialLat);
  const [longitude, setLongitude] = useState(initialLng);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      setError('Clé API Google Maps non configurée');
      setLoading(false);
      return;
    }

    const loader = new GoogleMapsLoader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geocoding'],
    });

    loader
      .load()
      .then((google) => {
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 13,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;
        geocoderRef.current = new google.maps.Geocoder();

        const marker = new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });

        markerRef.current = marker;

        marker.addListener('dragend', () => {
          const position = marker.getPosition();
          if (position) {
            const lat = position.lat();
            const lng = position.lng();
            setLatitude(lat);
            setLongitude(lng);
            reverseGeocode(lat, lng);
          }
        });

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setLatitude(lat);
            setLongitude(lng);
            marker.setPosition(e.latLng);
            reverseGeocode(lat, lng);
          }
        });

        reverseGeocode(latitude, longitude);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err);
        setError('Erreur lors du chargement de la carte');
        setLoading(false);
      });
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!geocoderRef.current) {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      return;
    }

    try {
      const result = await geocoderRef.current.geocode({
        location: { lat, lng },
      });

      if (result.results[0]) {
        setAddress(result.results[0].formatted_address);
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        if (mapInstanceRef.current && markerRef.current) {
          const newPosition = { lat, lng };
          mapInstanceRef.current.setCenter(newPosition);
          markerRef.current.setPosition(newPosition);
          reverseGeocode(lat, lng);
        }

        setLoading(false);
      },
      (error) => {
        setError("Impossible d'obtenir votre position");
        setLoading(false);
        console.error('Geolocation error:', error);
      }
    );
  };

  const handleConfirm = () => {
    if (latitude && longitude) {
      onLocationSelect(latitude, longitude, address);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Sélectionner la localisation
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="hover:bg-white hover:bg-opacity-20 p-1 rounded"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={getCurrentLocation}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Navigation className="w-5 h-5" />
              {loading ? 'Localisation...' : 'Ma position'}
            </button>
          </div>

          <div
            ref={mapRef}
            className="w-full h-96 rounded-lg border border-gray-300 bg-gray-100 flex items-center justify-center"
          >
            {loading && (
              <div className="flex flex-col items-center gap-3 text-gray-600">
                <Loader className="w-8 h-8 animate-spin" />
                <p>Chargement de la carte...</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">Position sélectionnée</p>
                <p className="text-sm text-gray-700 break-words">
                  {address || 'Cliquez sur la carte pour sélectionner une position'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>💡 Astuces:</strong>
            </p>
            <ul className="text-sm text-green-700 mt-2 space-y-1 ml-4 list-disc">
              <li>Cliquez sur la carte pour placer le marqueur</li>
              <li>Déplacez le marqueur rouge en le faisant glisser</li>
              <li>Utilisez le zoom pour plus de précision</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
            )}
            <button
              onClick={handleConfirm}
              disabled={!latitude || !longitude || loading}
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
