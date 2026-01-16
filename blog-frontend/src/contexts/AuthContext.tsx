'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { getToken, getUser, setAuth as setAuthStorage, clearAuth as clearAuthStorage } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load auth state from localStorage on mount
    const storedToken = getToken();
    const storedUser = getUser();
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    
    setLoading(false);
  }, []);

  const setAuth = (newToken: string, newUser: User) => {
    setAuthStorage(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const clearAuth = () => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN',
    setAuth,
    clearAuth,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
