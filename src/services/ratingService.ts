import { PubRating } from '../types';

// Local storage key for ratings
const RATINGS_KEY = 'pubcrawl_ratings';

// Helper functions for localStorage
const getStoredRatings = (): PubRating[] => {
  try {
    const stored = localStorage.getItem(RATINGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRatings = (ratings: PubRating[]): void => {
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
};

export const ratingService = {
  async addRating(pubId: string, userId: string, rating: number, comment: string): Promise<{ message: string }> {
    const ratings = getStoredRatings();
    
    // Check if user already rated this pub
    const existingRatingIndex = ratings.findIndex(r => r.pubId === pubId && r.userId === userId);
    
    const newRating: PubRating = {
      id: `rating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pubId,
      userId,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };

    if (existingRatingIndex >= 0) {
      // Update existing rating
      ratings[existingRatingIndex] = newRating;
    } else {
      // Add new rating
      ratings.push(newRating);
    }

    saveRatings(ratings);
    return { message: 'Rating saved successfully' };
  },

  async getRatingsForPub(pubId: string): Promise<PubRating[]> {
    const ratings = getStoredRatings();
    return ratings.filter(r => r.pubId === pubId);
  },

  async getAverageRating(pubId: string): Promise<number> {
    const ratings = await this.getRatingsForPub(pubId);
    if (ratings.length === 0) return 0;
    
    const sum = ratings.reduce((total, rating) => total + rating.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
  },

  async getUserRating(pubId: string, userId: string): Promise<PubRating | null> {
    const ratings = getStoredRatings();
    return ratings.find(r => r.pubId === pubId && r.userId === userId) || null;
  },

  async deleteRating(ratingId: string): Promise<{ message: string }> {
    const ratings = getStoredRatings();
    const filteredRatings = ratings.filter(r => r.id !== ratingId);
    saveRatings(filteredRatings);
    return { message: 'Rating deleted successfully' };
  }
};
