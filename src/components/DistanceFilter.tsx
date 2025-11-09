import { Navigation } from 'lucide-react';

interface DistanceFilterProps {
  maxDistance: number;
  onMaxDistanceChange: (distance: number) => void;
  showFilter: boolean;
}

const DISTANCE_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: 1000, label: 'Tout' },
];

export default function DistanceFilter({ maxDistance, onMaxDistanceChange, showFilter }: DistanceFilterProps) {
  if (!showFilter) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Navigation className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Filtrer par distance</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {DISTANCE_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => onMaxDistanceChange(option.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              maxDistance === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {maxDistance < 1000 && (
        <p className="text-sm text-blue-700 mt-3">
          Affiche uniquement les artisans à moins de {maxDistance} km
        </p>
      )}
    </div>
  );
}
