import { PubRating } from '../types';

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
};

export const ratingService = {
  async addRating(pubId: string, userId: string, rating: number, comment: string): Promise<{ message: string }> {
    return apiCall('/pub-ratings', {
      method: 'POST',
      body: JSON.stringify({
        pubId,
        userId,
        rating,
        comment: comment.trim()
      })
    });
  },

  async getRatingsForPub(pubId: string): Promise<PubRating[]> {
    const rows = await apiCall(`/pub-ratings/${pubId}`);
    return (rows as any[]).map(r => ({
      id: r.id,
      pubId: r.pub_id ?? r.pubId,
      userId: r.user_id ?? r.userId,
      username: r.username,
      rating: r.rating,
      comment: r.comment ?? '',
      createdAt: r.created_at ?? r.createdAt,
    } satisfies PubRating));
  },

  async getAverageRating(pubId: string): Promise<number> {
    const ratings = await this.getRatingsForPub(pubId);
    if (ratings.length === 0) return 0;
    
    const sum = ratings.reduce((total, rating) => total + rating.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  },

  async getUserRating(pubId: string, userId: string): Promise<PubRating | null> {
    try {
      const ratings = await this.getRatingsForPub(pubId);
      return ratings.find(r => r.userId === userId) || null;
    } catch (error) {
      return null;
    }
  },

  // Optimalizált függvény: egy API hívással minden adatot lekér
  async getRatingsData(pubId: string, userId?: string): Promise<{
    ratings: PubRating[];
    averageRating: number;
    userRating: PubRating | null;
  }> {
    const ratings = await this.getRatingsForPub(pubId);
    
    const averageRating = ratings.length === 0 
      ? 0 
      : Math.round((ratings.reduce((total, rating) => total + rating.rating, 0) / ratings.length) * 10) / 10;
    
    const userRating = userId 
      ? ratings.find(r => r.userId === userId) || null 
      : null;
    
    return {
      ratings,
      averageRating,
      userRating
    };
  },

  async deleteRating(ratingId: string): Promise<{ message: string }> {
    return apiCall(`/pub-ratings/${ratingId}`, {
      method: 'DELETE'
    });
  }
};
