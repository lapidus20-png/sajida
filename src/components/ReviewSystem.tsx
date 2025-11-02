import { useState } from 'react';
import { Star, AlertCircle, X } from 'lucide-react';
import { supabase, Contract } from '../lib/supabase';

interface ReviewSystemProps {
  contract: Contract;
  reviewedUserId: string;
  reviewedUserName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewSystem({
  contract,
  reviewedUserId,
  reviewedUserName,
  onClose,
  onSuccess,
}: ReviewSystemProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error('Utilisateur non authentifié');

      const verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          contract_id: contract.id,
          reviewer_id: userData.user.id,
          reviewed_user_id: reviewedUserId,
          note: rating,
          commentaire: comment,
          verification_code: verificationCode,
          verified: false,
        });

      if (insertError) throw new Error(insertError.message);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'avis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 text-white flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold">Évaluer {reviewedUserName}</h2>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-1 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Note</label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              {rating === 5 && 'Excellent! 😍'}
              {rating === 4 && 'Très bon 😊'}
              {rating === 3 && 'Correct 👍'}
              {rating === 2 && 'Pourrait être mieux 😐'}
              {rating === 1 && 'Déçu 😞'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Votre avis (optionnel)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Partagez votre expérience, ce qui a été bien, les points à améliorer..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{comment.length}/500</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Veuillez laisser un avis honnête et constructif. Les avis faux ou abusifs seront supprimés.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Envoi...' : 'Soumettre l\'avis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
