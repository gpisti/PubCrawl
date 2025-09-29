import React from 'react';
import { MapPin, Home, List, Navigation as NavigationIcon, LogOut } from 'lucide-react';
import { useGuestAuth } from '../contexts/GuestAuthContext';

interface NavigationProps {
  currentPage: 'home' | 'planner' | 'routes';
  onNavigate: (page: 'home' | 'planner' | 'routes') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useGuestAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">PubCrawl Planner</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'home'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </button>
            
            <button
              onClick={() => onNavigate('planner')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'planner'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <NavigationIcon className="h-4 w-4" />
              <span>Route Optimizer</span>
            </button>
            
            <button
              onClick={() => onNavigate('routes')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'routes'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <List className="h-4 w-4" />
              <span>My Routes</span>
            </button>

            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{user.avatar}</span>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Kijelentkezés"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};