import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GuestUser } from '../types';

interface GuestAuthContextType {
  user: GuestUser | null;
  login: (name: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const GuestAuthContext = createContext<GuestAuthContextType | undefined>(undefined);

// Random avatárok
const AVATARS = ['🍺', '🍸', '🍷', '🥃', '🍻', '🍹', '🥤', '🍾', '🍺', '🍸'];

const generateRandomAvatar = (): string => {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
};

const generateGuestId = (): string => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

interface GuestAuthProviderProps {
  children: ReactNode;
}

export const GuestAuthProvider: React.FC<GuestAuthProviderProps> = ({ children }: GuestAuthProviderProps) => {
  const [user, setUser] = useState<GuestUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on app start
    try {
      const stored = localStorage.getItem('pubcrawl_guest_user');
      if (stored) {
        const guestUser = JSON.parse(stored);
        setUser(guestUser);
      }
    } catch (error) {
      console.warn('Failed to load guest user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (name: string) => {
    const guestUser: GuestUser = {
      id: generateGuestId(),
      name: name.trim(),
      avatar: generateRandomAvatar(),
      createdAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('pubcrawl_guest_user', JSON.stringify(guestUser));
      setUser(guestUser);
    } catch (error) {
      console.error('Failed to save guest user:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('pubcrawl_guest_user');
      setUser(null);
    } catch (error) {
      console.error('Failed to logout guest user:', error);
    }
  };

  const value: GuestAuthContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <GuestAuthContext.Provider value={value}>
      {children}
    </GuestAuthContext.Provider>
  );
};

export const useGuestAuth = (): GuestAuthContextType => {
  const context = useContext(GuestAuthContext);
  if (context === undefined) {
    throw new Error('useGuestAuth must be used within a GuestAuthProvider');
  }
  return context;
};
