import { useState, useEffect } from 'react';
import { MessageSquare, User } from 'lucide-react';
import { ratingService } from '../services/ratingService';
import { useGuestAuth } from '../contexts/GuestAuthContext';
import { PubRating } from '../types';

interface PubRatingProps {
  pubId: string;
  pubName: string;
  onClose: () => void;
}

export const PubRatingComponent: React.FC<PubRatingProps> = ({ pubId, pubName, onClose }: PubRatingProps) => {
  const [ratings, setRatings] = useState<PubRating[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [userRating, setUserRating] = useState<PubRating | null>(null);
  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { user } = useGuestAuth();

  useEffect(() => {
    loadRatings();
  }, [pubId]);

  // Debug effect to track newRating changes
  useEffect(() => {
    console.log('newRating changed to:', newRating);
  }, [newRating]);

  const loadRatings = async () => {
    try {
      const [pubRatings, avgRating, currentUserRating] = await Promise.all([
        ratingService.getRatingsForPub(pubId),
        ratingService.getAverageRating(pubId),
        user ? ratingService.getUserRating(pubId, user.id) : Promise.resolve(null)
      ]);
      
      setRatings(pubRatings);
      setAverageRating(avgRating);
      setUserRating(currentUserRating);
      
      if (currentUserRating) {
        setNewRating(currentUserRating.rating);
        setNewComment(currentUserRating.comment);
      } else {
        // Reset to 0 if no existing rating
        setNewRating(0);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to load ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newRating === 0) return;

    setIsSubmitting(true);
    try {
      await ratingService.addRating(pubId, user.id, newRating, newComment);
      await loadRatings(); // Reload ratings
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    console.log('Rendering stars with rating:', rating, 'interactive:', interactive);
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= rating;
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => {
                if (interactive) {
                  console.log('Star clicked:', star, 'Setting newRating to:', star);
                  setNewRating(star);
                }
              }}
              className={`text-lg transition-all duration-200 ${
                isFilled
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              } ${interactive ? 'hover:text-yellow-300 cursor-pointer hover:scale-110' : ''}`}
              style={{
                filter: isFilled ? 'none' : 'grayscale(100%)'
              }}
            >
              ⭐
            </button>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              {pubName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Average Rating */}
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Átlagos értékelés</h3>
                <p className="text-xs text-gray-600">{ratings.length} értékelés</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{averageRating}</div>
                {renderStars(Math.round(averageRating))}
              </div>
            </div>
          </div>

          {/* User Rating Form */}
          {user && (
            <form onSubmit={handleSubmitRating} className="bg-blue-50 p-3 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                <User className="h-4 w-4 mr-2" />
                {userRating ? 'Értékelésed szerkesztése' : 'Értékelés hozzáadása'}
              </h3>
              
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Értékelés (jelenleg: {newRating})
                </label>
                {renderStars(newRating, true)}
              </div>

              <div className="mb-3">
                <label htmlFor="comment" className="block text-xs font-medium text-gray-700 mb-1">
                  Komment (opcionális)
                </label>
                <textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="pl. Jó sör, hangos zene..."
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={2}
                  maxLength={200}
                />
              </div>

              <button
                type="submit"
                disabled={newRating === 0 || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1 rounded-lg font-medium transition-colors text-sm"
              >
                {isSubmitting ? 'Mentés...' : userRating ? 'Frissítés' : 'Értékelés küldése'}
              </button>
            </form>
          )}

          {/* All Ratings */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Összes értékelés</h3>
            {ratings.length === 0 ? (
              <p className="text-gray-500 text-center py-2 text-sm">Még nincsenek értékelések.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {ratings.map((rating) => (
                  <div key={rating.id} className="border border-gray-200 rounded-lg p-2">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-900">
                          {rating.userId === user?.id ? 'Te' : 'Felhasználó'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString('hu-HU')}
                        </span>
                      </div>
                      {renderStars(rating.rating)}
                    </div>
                    {rating.comment && (
                      <p className="text-gray-700 text-xs">{rating.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
