import React, { useState } from 'react';
import { MapPin, Route, Clock, Navigation, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { PubMap } from './PubMap';
import { debrecenPubs, PubLocation } from '../data/debrecenPubs';
import { optimizeRoute, OptimizedRoute } from '../utils/routeOptimizer';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface RouteOptimizerPageProps {
  onRouteCreated: () => void;
}

export const RouteOptimizerPage: React.FC<RouteOptimizerPageProps> = ({ onRouteCreated }: RouteOptimizerPageProps) => {
  const [selectedPubs, setSelectedPubs] = useState<PubLocation[]>([]);
  const [optimizedRouteData, setOptimizedRouteData] = useState<OptimizedRoute | null>(null);
  const [routeName, setRouteName] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  const handlePubSelect = (pub: PubLocation) => {
    if (!selectedPubs.some(selected => selected.id === pub.id)) {
      setSelectedPubs([...selectedPubs, pub]);
    }
  };

  const handlePubDeselect = (pub: PubLocation) => {
    setSelectedPubs(selectedPubs.filter(selected => selected.id !== pub.id));
  };

  const handleOptimizeRoute = async () => {
    if (selectedPubs.length < 2) {
      setError('Please select at least 2 pubs to optimize the route');
      return;
    }

    setIsOptimizing(true);
    setError('');

    // Simulate processing time for better UX
    setTimeout(() => {
      const optimized = optimizeRoute(selectedPubs);
      setOptimizedRouteData(optimized);
      setIsOptimizing(false);
    }, 1000);
  };

  const handleSaveRoute = async () => {
    if (!optimizedRouteData || !routeName.trim()) {
      setError('Please provide a route name and optimize the route first');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const pubsToSave = optimizedRouteData.pubs.map(pub => ({
        pub_name: pub.name,
        address: pub.address,
        note: `${pub.description} (${pub.type})`
      }));

      if (!user) {
        setError('You must be logged in to save routes');
        return;
      }
      
      await api.createRoute(routeName, pubsToSave, user.id);
      setSuccess('Route saved successfully!');
      
      // Reset form
      setRouteName('');
      setSelectedPubs([]);
      setOptimizedRouteData(null);
      
      setTimeout(() => {
        onRouteCreated();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save route');
    } finally {
      setIsSaving(false);
    }
  };

  const clearSelection = () => {
    setSelectedPubs([]);
    setOptimizedRouteData(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
            <Navigation className="h-8 w-8 mr-3 text-emerald-600" />
            Debrecen Pub Crawl Route Optimizer
          </h1>
          <p className="text-lg text-gray-600">
            Select from {debrecenPubs.length} authentic Debrecen pubs and we'll optimize your walking route for the perfect pub crawl!
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Interactive Map of Debrecen Pubs
              </h2>
              <p className="text-gray-600 mb-4">
                Click on pub markers to add them to your route. Selected pubs will turn green.
              </p>
              
              <PubMap
                pubs={debrecenPubs}
                selectedPubs={selectedPubs}
                optimizedRoute={optimizedRouteData?.pubs}
                onPubSelect={handlePubSelect}
                onPubDeselect={handlePubDeselect}
              />
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Selected Pubs */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Selected Pubs ({selectedPubs.length})
              </h3>
              
              {selectedPubs.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Click on pubs on the map to add them to your route
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedPubs.map((pub) => (
                    <div key={pub.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{pub.name}</p>
                        <p className="text-xs text-gray-500">{pub.type}</p>
                      </div>
                      <button
                        onClick={() => handlePubDeselect(pub)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 space-y-2">
                <button
                  onClick={handleOptimizeRoute}
                  disabled={selectedPubs.length < 2 || isOptimizing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Route className="h-4 w-4 mr-2" />
                  {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
                </button>
                
                {selectedPubs.length > 0 && (
                  <button
                    onClick={clearSelection}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>

            {/* Route Results */}
            {optimizedRouteData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Optimized Route
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <p className="text-sm text-emerald-600 font-medium">Total Distance</p>
                      <p className="text-lg font-bold text-emerald-800">
                        {optimizedRouteData.totalDistance} km
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Walking Time
                      </p>
                      <p className="text-lg font-bold text-blue-800">
                        {optimizedRouteData.estimatedWalkingTime} min
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900 mb-2">Route Order:</p>
                    <div className="space-y-1">
                      {optimizedRouteData.pubs.map((pub, index) => (
                        <div key={pub.id} className="flex items-center text-sm">
                          <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2">
                            {index + 1}
                          </span>
                          <span>{pub.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Route */}
                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Route Name
                    </label>
                    <input
                      type="text"
                      value={routeName}
                      onChange={(e) => setRouteName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-3"
                      placeholder="e.g., Saturday Night Crawl"
                    />
                    <button
                      onClick={handleSaveRoute}
                      disabled={!routeName.trim() || isSaving}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Route'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};