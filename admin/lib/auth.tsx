'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchApi } from './api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ergocraft_admin_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await fetchApi<{ user: AdminUser }>('/auth/me');
          if (res.data?.user && res.data.user.role === 'admin') {
            setUser(res.data.user);
          } else {
            // Not an admin
            localStorage.removeItem('ergocraft_admin_token');
            setUser(null);
            setToken(null);
          }
        } catch {
          localStorage.removeItem('ergocraft_admin_token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Route protection
  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    const res = await fetchApi<{ user: AdminUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.data.user.role !== 'admin') {
      throw new Error('Access denied: You do not have administrator privileges.');
    }

    localStorage.setItem('ergocraft_admin_token', res.data.token);
    setUser(res.data.user);
    setToken(res.data.token);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    localStorage.removeItem('ergocraft_admin_token');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
