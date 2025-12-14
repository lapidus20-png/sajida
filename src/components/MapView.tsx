import { useEffect, useRef, useState } from 'react';
import { Loader as GoogleMapsLoader } from '@googlemaps/js-api-loader';
import { MapPin, Loader } from 'lucide-react';

interface MapViewProps {
  artisans: Array<{
    id: string;
    nom: string;
    prenom: string;
    metier: string;
    latitude?: number;
    longitude?: number;
    photo_url?: string;
  }>;
  userLat?: number;
  userLng?: number;
  onArtisanClick?: (artisanId: string) => void;
}

export default function MapView({ artisans, userLat, userLng, onArtisanClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      libraries: ['marker'],
    });

    loader
      .load()
      .then((google) => {
        if (!mapRef.current) return;

        const centerLat = userLat || 12.3714;
        const centerLng = userLng || -1.5197;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        mapInstanceRef.current = map;

        if (userLat && userLng) {
          new google.maps.Marker({
            position: { lat: userLat, lng: userLng },
            map,
            title: 'Votre position',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#3B82F6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 8,
            },
          });
        }

        artisans.forEach((artisan) => {
          if (artisan.latitude && artisan.longitude) {
            const metiers = artisan.metier ? (Array.isArray(artisan.metier) ? artisan.metier : [artisan.metier]) : [];
            const metierDisplay = metiers.length > 0 && metiers[0]
              ? metiers.join(', ')
              : 'Métier non spécifié';

            const marker = new google.maps.Marker({
              position: { lat: artisan.latitude, lng: artisan.longitude },
              map,
              title: `${artisan.prenom} ${artisan.nom} - ${metierDisplay}`,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#F59E0B',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 6,
              },
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; min-width: 200px;">
                  <h3 style="margin: 0 0 4px 0; font-weight: bold; font-size: 16px;">
                    ${artisan.prenom} ${artisan.nom}
                  </h3>
                  <p style="margin: 0; color: #F59E0B; font-weight: 600; font-size: 14px;">
                    ${metierDisplay}
                  </p>
                </div>
              `,
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
              if (onArtisanClick) {
                onArtisanClick(artisan.id);
              }
            });

            markersRef.current.push(marker);
          }
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err);
        setError('Erreur lors du chargement de la carte');
        setLoading(false);
      });

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [artisans, userLat, userLng]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <MapPin className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-700 font-medium">{error}</p>
        <p className="text-sm text-red-600 mt-2">
          Veuillez configurer votre clé API Google Maps
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden border border-gray-300">
      <div ref={mapRef} className="w-full h-full">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full bg-gray-100">
            <Loader className="w-8 h-8 text-amber-600 animate-spin mb-3" />
            <p className="text-gray-600">Chargement de la carte...</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
          <span className="text-sm text-gray-700">Votre position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full border-2 border-white"></div>
          <span className="text-sm text-gray-700">Artisans ({artisans.filter(a => a.latitude && a.longitude).length})</span>
        </div>
      </div>
    </div>
  );
}
