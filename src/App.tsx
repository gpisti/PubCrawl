import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { RouteOptimizerPage } from './components/RouteOptimizerPage';
import { SavedRoutesPage } from './components/SavedRoutesPage';
import { WelcomeModal } from './components/WelcomeModal';
import { GuestAuthProvider, useGuestAuth } from './contexts/GuestAuthContext';
import { api } from './services/api';

type Page = 'home' | 'planner' | 'routes';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [refreshRoutes, setRefreshRoutes] = useState(0);
  const [joinMessage, setJoinMessage] = useState('');
  const { user, isLoading } = useGuestAuth();

  // Handle URL routing for route sharing
  useEffect(() => {
    const handleRouteJoin = async () => {
      const path = window.location.pathname;
      const joinMatch = path.match(/^\/join\/(.+)$/);
      
      if (joinMatch && user) {
        const routeId = joinMatch[1];
        try {
          await api.joinRoute(routeId, user.id);
          setJoinMessage('Successfully joined the route!');
          setCurrentPage('routes');
          setRefreshRoutes(prev => prev + 1);
          // Clean up URL
          window.history.replaceState({}, '', '/');
        } catch (error: any) {
          setJoinMessage(`Failed to join route: ${error.message}`);
        }
      }
    };

    if (!isLoading) {
      handleRouteJoin();
    }
  }, [user, isLoading]);

  const handleStartPlanning = () => {
    setCurrentPage('planner');
  };

  const handleRouteCreated = () => {
    setRefreshRoutes(prev => prev + 1); // Trigger refresh
    setCurrentPage('routes');
  };

  const handleCreateNew = () => {
    setCurrentPage('planner');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      
      {/* Join Message */}
      {joinMessage && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-4 rounded">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">{joinMessage}</p>
            </div>
            <button
              onClick={() => setJoinMessage('')}
              className="ml-auto text-blue-400 hover:text-blue-600"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {currentPage === 'home' && (
        <HomePage onStartPlanning={handleStartPlanning} />
      )}
      
      {currentPage === 'planner' && (
        <RouteOptimizerPage onRouteCreated={handleRouteCreated} />
      )}
      
      {currentPage === 'routes' && (
        <SavedRoutesPage onCreateNew={handleCreateNew} key={refreshRoutes} />
      )}

      <WelcomeModal isOpen={!user} />
    </div>
  );
};

function App() {
  return (
    <GuestAuthProvider>
      <AppContent />
    </GuestAuthProvider>
  );
}

export default App;