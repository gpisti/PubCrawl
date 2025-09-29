import React, { useState } from 'react';
import { Plus, Trash2, MapPin, Save, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Pub } from '../types';

interface RoutePlannerPageProps {
  onRouteCreated: () => void;
}

export const RoutePlannerPage: React.FC<RoutePlannerPageProps> = ({ onRouteCreated }) => {
  const [routeName, setRouteName] = useState('');
  const [pubs, setPubs] = useState<Pub[]>([
    { pub_name: '', address: '', note: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addPub = () => {
    setPubs([...pubs, { pub_name: '', address: '', note: '' }]);
  };

  const removePub = (index: number) => {
    if (pubs.length > 1) {
      setPubs(pubs.filter((_, i) => i !== index));
    }
  };

  const updatePub = (index: number, field: keyof Pub, value: string) => {
    const updatedPubs = pubs.map((pub, i) => 
      i === index ? { ...pub, [field]: value } : pub
    );
    setPubs(updatedPubs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!routeName.trim()) {
      setError('Route name is required');
      return;
    }

    const validPubs = pubs.filter(pub => pub.pub_name.trim() && pub.address.trim());
    if (validPubs.length === 0) {
      setError('At least one pub with name and address is required');
      return;
    }

    setIsLoading(true);

    try {
      await api.createRoute(routeName, validPubs);
      setSuccess('Route created successfully!');
      setRouteName('');
      setPubs([{ pub_name: '', address: '', note: '' }]);
      setTimeout(() => {
        onRouteCreated();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create route');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <MapPin className="h-8 w-8 mr-3" />
              Plan Your Pub Crawl Route
            </h1>
            <p className="text-emerald-100 mt-2">
              Add pubs to create your perfect crawl route
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <Save className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700">{success}</span>
              </div>
            )}

            <div className="mb-8">
              <label htmlFor="routeName" className="block text-sm font-medium text-gray-700 mb-2">
                Route Name *
              </label>
              <input
                type="text"
                id="routeName"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="e.g., Downtown Saturday Night Crawl"
                required
              />
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Pubs on Your Route</h2>
                <button
                  type="button"
                  onClick={addPub}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Pub</span>
                </button>
              </div>

              <div className="space-y-6">
                {pubs.map((pub, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Pub #{index + 1}
                      </h3>
                      {pubs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePub(index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pub Name *
                        </label>
                        <input
                          type="text"
                          value={pub.pub_name}
                          onChange={(e) => updatePub(index, 'pub_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          placeholder="The Crown & Anchor"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address *
                        </label>
                        <input
                          type="text"
                          value={pub.address}
                          onChange={(e) => updatePub(index, 'address', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          placeholder="123 Main Street"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={pub.note}
                        onChange={(e) => updatePub(index, 'note', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="Great beer selection, outdoor seating..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                <Save className="h-5 w-5" />
                <span>{isLoading ? 'Saving...' : 'Save Route'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};