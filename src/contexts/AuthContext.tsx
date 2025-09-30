import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface GuestAuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<GuestAuthProviderProps> = ({ children }: GuestAuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on app start
    try {
      const stored = localStorage.getItem('pubcrawl_user');
      if (stored) {
        const userData = JSON.parse(stored);
        setUser(userData);
      }
    } catch (error) {
      console.warn('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const userData = await response.json();
    const user: User = {
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('pubcrawl_user', JSON.stringify(user));
    setUser(user);
  };

  const register = async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const userData = await response.json();
    const user: User = {
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('pubcrawl_user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    try {
      localStorage.removeItem('pubcrawl_user');
      setUser(null);
    } catch (error) {
      console.error('Failed to logout user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
