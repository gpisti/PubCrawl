import React from 'react';
import { MapPin, Users, Route, Star } from 'lucide-react';

interface HomePageProps {
  onStartPlanning: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStartPlanning }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-emerald-100 p-4 rounded-full">
                <MapPin className="h-16 w-16 text-emerald-600" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Optimize Your Perfect
              <span className="text-emerald-600 block">Debrecen Pub Crawl</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover the best pubs in Debrecen and let our smart algorithm find the shortest walking route for your perfect pub crawl. 
              No more wandering around - just pure optimization and fun!
            </p>
            
            <button
              onClick={onStartPlanning}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Optimizing Your Route
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Smart Route Optimization for Debrecen
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced algorithms meet local pub knowledge for the perfect night out
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Route className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Route Optimization</h3>
              <p className="text-gray-600">
                Select pubs from our curated list of Debrecen's best venues and our algorithm finds the shortest walking route automatically.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive Map</h3>
              <p className="text-gray-600">
                Explore Debrecen's pub scene on an interactive map. See real locations, distances, and get detailed information about each venue.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Local Expertise</h3>
              <p className="text-gray-600">
                Our database includes the best pubs, bars, and breweries in Debrecen with detailed descriptions and authentic local recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Optimize Your Pub Crawl?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Experience Debrecen's best pubs with the most efficient route possible
          </p>
          <button
            onClick={onStartPlanning}
            className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Start Route Optimization
          </button>
        </div>
      </div>
    </div>
  );
};