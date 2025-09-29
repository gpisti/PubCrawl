import { Route, RouteWithPubCount, Pub } from '../types';

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

export const api = {
  async createRoute(name: string, pubs: Pub[], ownerId: string): Promise<{ id: string; message: string }> {
    return apiCall('/routes', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        pubs,
        ownerId
      })
    });
  },

  async getRoutes(userId: string): Promise<RouteWithPubCount[]> {
    return apiCall(`/routes?userId=${encodeURIComponent(userId)}`);
  },

  async getRoute(id: string): Promise<Route> {
    return apiCall(`/routes/${id}`);
  },

  async deleteRoute(id: string): Promise<{ message: string }> {
    return apiCall(`/routes/${id}`, {
      method: 'DELETE'
    });
  },

  async completeRoute(id: string): Promise<{ message: string }> {
    return apiCall(`/routes/${id}/complete`, {
      method: 'PATCH'
    });
  },

  async joinRoute(routeId: string, userId: string): Promise<{ message: string }> {
    return apiCall(`/routes/${routeId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },

  async leaveRoute(routeId: string, userId: string): Promise<{ message: string }> {
    return apiCall(`/routes/${routeId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },

  async getSharedRoutes(userId: string): Promise<RouteWithPubCount[]> {
    return apiCall(`/routes?userId=${encodeURIComponent(userId)}`);
  },
};