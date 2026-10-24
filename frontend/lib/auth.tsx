'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ApiError, fetchApi } from './api';
import type { UserProfile } from './types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  authError: null,
  login: async () => {
    throw new Error('Not implemented');
  },
  register: async () => {
    throw new Error('Not implemented');
  },
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const storedToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('ergocraft_customer_token')
        : null;

    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      setAuthError(null);
      return;
    }

    try {
      const res = await fetchApi<{ user: UserProfile }>('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        setToken(storedToken);
        setAuthError(null);
      } else {
        localStorage.removeItem('ergocraft_customer_token');
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        localStorage.removeItem('ergocraft_customer_token');
        setToken(null);
      } else {
        setToken(storedToken);
      }
      setUser(null);
      setAuthError('We could not restore your session. Check your connection and sign in again if needed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshUser(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const res = await fetchApi<{ user: UserProfile; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('ergocraft_customer_token', res.data.token);
    }
    setUser(res.data.user);
    setToken(res.data.token);
    setAuthError(null);
    return res.data.user;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<UserProfile> => {
    const res = await fetchApi<{ user: UserProfile; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('ergocraft_customer_token', res.data.token);
    }
    setUser(res.data.user);
    setToken(res.data.token);
    setAuthError(null);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch {
      setAuthError('The server could not confirm sign out. The local session was cleared.');
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ergocraft_customer_token');
    }
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
