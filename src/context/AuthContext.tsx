import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types/api';
import * as api from '../api/client';

const STORAGE_KEY = 'accessToken';

const DEMO_USER: User = {
  _id: 'demo',
  email: 'demo@bizxflow.app',
  fullName: 'Demo User',
  role: 'admin',
  profilePicture: undefined,
};

type AuthState = {
  user: User | null;
  loading: boolean;
  token: string | null;
};

const AuthContext = createContext<AuthState & {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, role?: import('../types/api').Role) => Promise<boolean>;
  logout: () => void;
  setUser: (u: User | null) => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
  }, []);

  const fetchUser = useCallback(async () => {
    const t = localStorage.getItem(STORAGE_KEY);
    if (!t) {
      setUserState(DEMO_USER);
      setLoading(false);
      return;
    }
    setToken(t);
    const res = await api.auth.me();
    if (res.success && res.data?.user) {
      setUserState(res.data.user);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
      setUserState(DEMO_USER);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.data?.accessToken) {
      localStorage.setItem(STORAGE_KEY, res.data.accessToken);
      setToken(res.data.accessToken);
      setUserState(res.data.user ?? null);
      return true;
    }
    return false;
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string, role?: import('../types/api').Role) => {
    const res = await api.auth.register({ email, password, fullName, role });
    if (res.success && res.data?.accessToken) {
      localStorage.setItem(STORAGE_KEY, res.data.accessToken);
      setToken(res.data.accessToken);
      setUserState(res.data.user ?? null);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUserState(DEMO_USER);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
