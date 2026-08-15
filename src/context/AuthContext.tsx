'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginResponse, ProfileUpdatePayload, AccountStatus } from '@/types/auth';
import { apiFetch, setStoredTokens, clearStoredTokens, getStoredTokens } from '@/services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isApproved: boolean;
  status: AccountStatus | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session from stored token on initial load
  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    const { access } = getStoredTokens();
    if (!access) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const userData = await apiFetch<User>('/api/accounts/me/');
      setUser(userData);
      localStorage.setItem('cached_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      console.warn('Failed to load authenticated user profile:', err);
      clearStoredTokens();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('cached_user');
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch {
      // ignore
    }
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (username: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await apiFetch<LoginResponse>('/api/accounts/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      setStoredTokens(response.access, response.refresh);
      setUser(response.user);
      localStorage.setItem('cached_user', JSON.stringify(response.user));
      return response.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearStoredTokens();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const refreshUser = async (): Promise<User | null> => {
    return await fetchCurrentUser();
  };

  const updateProfile = async (payload: ProfileUpdatePayload): Promise<User> => {
    const updatedUser = await apiFetch<User>('/api/accounts/profile/', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    setUser(updatedUser);
    localStorage.setItem('cached_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const isAuthenticated = !!user;
  const isApproved = Boolean(user?.is_staff || user?.profile?.status === 'approved');
  const status = user?.profile?.status || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isApproved,
        status,
        login,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
