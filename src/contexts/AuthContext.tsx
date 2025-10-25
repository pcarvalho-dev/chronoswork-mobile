import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { User, RegisterData } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount
  const loadUserProfile = useCallback(async () => {
    try {
      const token = await api.getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const { user: profileUser } = await api.getProfile();
      setUser(profileUser);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Try to refresh token if profile fetch fails
      try {
        await api.refreshToken();
        const { user: profileUser } = await api.getProfile();
        setUser(profileUser);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        // Clear tokens if refresh fails
        await api.clearTokens();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setUser(response.user);
  };

  const register = async (userData: RegisterData) => {
    const response = await api.register(userData);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      await api.clearTokens();
    }
  };

  const refreshUserProfile = async () => {
    try {
      const { user: profileUser } = await api.getProfile();
      setUser(profileUser);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUserProfile,
    isAuthenticated: !!user,
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
