import { useState, useEffect } from 'react';
import { MapPin, Calendar, ArrowRight, Eye, Users, Trash2, AlertTriangle, Plus, Minus, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { RouteWithPubCount, Route, Drink, DrinkEntry } from '../types';
import { RouteSharing } from './RouteSharing';
import { useGuestAuth } from '../contexts/GuestAuthContext';

interface SavedRoutesPageProps {
  onCreateNew: () => void;
}

// Drink types with predefined data
const DRINK_TYPES: Drink[] = [
  { id: 'beer', name: 'Sör', type: 'beer', calories: 150, alcoholContent: 5, icon: '🍺' },
  { id: 'cocktail', name: 'Koktél', type: 'cocktail', calories: 200, alcoholContent: 15, icon: '🍸' },
  { id: 'wine', name: 'Bor', type: 'wine', calories: 120, alcoholContent: 12, icon: '🍷' },
  { id: 'shot', name: 'Pálinka', type: 'shot', calories: 100, alcoholContent: 40, icon: '🥃' },
  { id: 'soft', name: 'Üdítő', type: 'soft', calories: 50, alcoholContent: 0, icon: '🥤' }
];

export const SavedRoutesPage: React.FC<SavedRoutesPageProps> = ({ onCreateNew }: SavedRoutesPageProps) => {
  const [routes, setRoutes] = useState<RouteWithPubCount[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [drinkEntries, setDrinkEntries] = useState<DrinkEntry[]>([]);
  const { user } = useGuestAuth();

  useEffect(() => {
    if (user) {
      fetchRoutes();
    } else {
      setIsLoading(false);
      setError('Please log in to view your routes');
    }
    loadDrinkEntries();
  }, [user]);

  const loadDrinkEntries = () => {
    try {
      const stored = localStorage.getItem('pubcrawl_drinks');
      if (stored) {
        setDrinkEntries(JSON.parse(stored));
      }
    } catch {
      setDrinkEntries([]);
    }
  };

  const saveDrinkEntries = (entries: DrinkEntry[]) => {
    localStorage.setItem('pubcrawl_drinks', JSON.stringify(entries));
    setDrinkEntries(entries);
  };

  const addDrink = (pubId: string, drinkId: string) => {
    if (!selectedRoute) return;
    
    const existingEntry = drinkEntries.find(entry => 
      entry.pubId === pubId && 
      entry.drinkId === drinkId && 
      entry.routeId === selectedRoute.id
    );
    
    if (existingEntry) {
      // Increment existing entry
      const updatedEntries = drinkEntries.map(entry => 
        entry.id === existingEntry.id 
          ? { ...entry, quantity: entry.quantity + 1 }
          : entry
      );
      saveDrinkEntries(updatedEntries);
    } else {
      // Create new entry
      const newEntry: DrinkEntry = {
        id: `drink_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        drinkId,
        pubId,
        routeId: selectedRoute.id,
        timestamp: new Date().toISOString(),
        quantity: 1
      };
      saveDrinkEntries([...drinkEntries, newEntry]);
    }
  };

  const removeDrink = (pubId: string, drinkId: string) => {
    if (!selectedRoute) return;
    
    const existingEntry = drinkEntries.find(entry => 
      entry.pubId === pubId && 
      entry.drinkId === drinkId && 
      entry.routeId === selectedRoute.id
    );
    
    if (existingEntry) {
      if (existingEntry.quantity > 1) {
        // Decrement quantity
        const updatedEntries = drinkEntries.map(entry => 
          entry.id === existingEntry.id 
            ? { ...entry, quantity: entry.quantity - 1 }
            : entry
        );
        saveDrinkEntries(updatedEntries);
      } else {
        // Remove entry completely
        const updatedEntries = drinkEntries.filter(entry => entry.id !== existingEntry.id);
        saveDrinkEntries(updatedEntries);
      }
    }
  };

  const getDrinkCount = (pubId: string, drinkId: string): number => {
    if (!selectedRoute) return 0;
    
    const entry = drinkEntries.find(entry => 
      entry.pubId === pubId && 
      entry.drinkId === drinkId && 
      entry.routeId === selectedRoute.id
    );
    return entry ? entry.quantity : 0;
  };

  const getTotalCalories = (): number => {
    if (!selectedRoute) return 0;
    
    return drinkEntries
      .filter(entry => entry.routeId === selectedRoute.id)
      .reduce((total, entry) => {
        const drink = DRINK_TYPES.find(d => d.id === entry.drinkId);
        return total + (drink ? drink.calories * entry.quantity : 0);
      }, 0);
  };

  const getAverageAlcoholPercentage = (): number => {
    if (!selectedRoute) return 0;
    
    const routeEntries = drinkEntries.filter(entry => entry.routeId === selectedRoute.id);
    
    const totalVolume = routeEntries.reduce((total, entry) => {
      const drink = DRINK_TYPES.find(d => d.id === entry.drinkId);
      // Feltételezzük, hogy minden ital 0.5 liter (standard pohár)
      return total + (drink ? entry.quantity * 0.5 : 0);
    }, 0);
    
    if (totalVolume === 0) return 0;
    
    const totalAlcohol = routeEntries.reduce((total, entry) => {
      const drink = DRINK_TYPES.find(d => d.id === entry.drinkId);
      // Alkohol mennyiség = térfogat × alkohol százalék
      return total + (drink ? entry.quantity * 0.5 * (drink.alcoholContent / 100) : 0);
    }, 0);
    
    // Átlagos alkohol százalék = összes alkohol ÷ összes térfogat × 100
    return Math.round((totalAlcohol / totalVolume) * 100);
  };

  const fetchRoutes = async () => {
    try {
      if (user) {
        const data = await api.getRoutes(user.id);
        setRoutes(data);
      } else {
        setError('User not logged in');
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError('Failed to load routes');
    } finally {
      setIsLoading(false);
    }
  };

  const viewRouteDetails = async (routeId: string) => {
    try {
      const route = await api.getRoute(routeId);
      setSelectedRoute(route);
    } catch (err) {
      setError('Failed to load route details');
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    setIsDeleting(true);
    setError('');
    
    try {
      await api.deleteRoute(routeId);
      // Refresh routes list
      await fetchRoutes();
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete route');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (routeId: string) => {
    setDeleteConfirm(routeId);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleCompleteRoute = async () => {
    if (!selectedRoute) return;
    
    setIsCompleting(true);
    setError('');
    
    try {
      await api.completeRoute(selectedRoute.id);
      // Refresh routes list
      await fetchRoutes();
      // Update selected route
      const updatedRoute = await api.getRoute(selectedRoute.id);
      setSelectedRoute(updatedRoute);
    } catch (err) {
      setError('Failed to complete route');
    } finally {
      setIsCompleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (selectedRoute) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center">
                    <MapPin className="h-8 w-8 mr-3" />
                    {selectedRoute.name}
                  </h1>
                  <p className="text-blue-100 mt-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {selectedRoute.status === 'completed' && selectedRoute.completed_at
                      ? `Completed on ${formatDate(selectedRoute.completed_at)}`
                      : `Created on ${formatDate(selectedRoute.created_at)}`
                    }
                  </p>
                  {selectedRoute.status === 'completed' && (
                    <div className="mt-2 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                      <span className="text-green-200 text-sm font-medium">Pub Crawl Completed! 🎉</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <RouteSharing
                    routeId={selectedRoute.id}
                    routeName={selectedRoute.name}
                    participants={typeof selectedRoute.participants === 'string' 
                      ? JSON.parse(selectedRoute.participants) 
                      : selectedRoute.participants || []}
                    onParticipantsUpdate={fetchRoutes}
                  />
                  {selectedRoute.status === 'active' && selectedRoute.ownerId === user?.id && (
                    <button
                      onClick={handleCompleteRoute}
                      disabled={isCompleting}
                      className="bg-green-500/20 hover:bg-green-500/30 disabled:bg-green-500/10 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                    >
                      {isCompleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Route
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedRoute(null)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Back to Routes
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Drink Tracker Summary */}
              <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  🍺 Drink Tracker
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-green-600">{getTotalCalories()}</div>
                    <div className="text-sm text-gray-600">Kalória</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">{getAverageAlcoholPercentage()}%</div>
                    <div className="text-sm text-gray-600">Átlagos alkohol</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">
                      {drinkEntries
                        .filter(entry => entry.routeId === selectedRoute.id)
                        .reduce((total, entry) => total + entry.quantity, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Ital</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Pubs on This Route ({selectedRoute.pubs?.length || 0})
                </h2>
              </div>

              {selectedRoute.pubs && selectedRoute.pubs.length > 0 ? (
                <div className="space-y-4">
                  {selectedRoute.pubs.map((pub, index) => (
                    <div key={pub.id || index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mr-3">
                              Stop #{index + 1}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {pub.pub_name}
                            </h3>
                          </div>
                          <p className="text-gray-600 mb-4 flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {pub.address}
                          </p>
                          {pub.note && (
                            <p className="text-gray-700 bg-white p-3 rounded border mb-4">
                              {pub.note}
                            </p>
                          )}
                          
                          {/* Drink Tracker for this pub */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">🍺 Mit ittál itt?</h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                              {DRINK_TYPES.map((drink) => {
                                const count = getDrinkCount(pub.id || '', drink.id);
                                return (
                                  <div key={drink.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <span className="text-lg">{drink.icon}</span>
                                    <div className="flex items-center space-x-1">
                                      <button
                                        onClick={() => removeDrink(pub.id || '', drink.id)}
                                        className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center text-sm"
                                        disabled={count === 0}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                      <span className="text-sm font-medium w-6 text-center">{count}</span>
                                      <button
                                        onClick={() => addDrink(pub.id || '', drink.id)}
                                        className="w-6 h-6 bg-green-100 hover:bg-green-200 text-green-600 rounded-full flex items-center justify-center text-sm"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pubs found for this route.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Saved Routes</h1>
          <p className="text-lg text-gray-600">
            Browse and revisit your pub crawl adventures
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading your routes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchRoutes}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : routes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No Routes Yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start planning your first pub crawl route and it will appear here for future reference.
            </p>
            <button
              onClick={onCreateNew}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Create Your First Route
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 flex-1">
                      {route.name}
                    </h3>
                    <div className="flex items-center space-x-2 ml-2">
                      <MapPin className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <button
                        onClick={() => confirmDelete(route.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        title="Delete route"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {route.pub_count || 0} pubs
                      </p>
                      {route.status === 'completed' && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {route.status === 'completed' && route.completed_at 
                        ? `Completed on ${formatDate(route.completed_at)}`
                        : `Created on ${formatDate(route.created_at)}`
                      }
                    </p>
                  </div>
                  
                  <button
                    onClick={() => viewRouteDetails(route.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Route
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this route? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRoute(deleteConfirm)}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};