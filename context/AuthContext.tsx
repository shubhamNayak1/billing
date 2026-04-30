
import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';
import { http, tokenStore, ApiError } from '../services/http';

interface LoginResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username: string, password: string) => {
    try {
      const res = await http.post<LoginResponse>('/auth/login', { username, password });
      tokenStore.set(res.token);
      setUser(res.user);
      localStorage.setItem('auth_user', JSON.stringify(res.user));
      return { ok: true };
    } catch (e) {
      const err = e as ApiError;
      return { ok: false, error: err?.message || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    tokenStore.clear();
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
