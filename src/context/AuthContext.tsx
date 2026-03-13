import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types/api';
import * as api from '../api/client';

const STORAGE_KEY = 'accessToken';

type AuthState = {
  user: User | null;
  loading: boolean;
  token: string | null;
};

export type AuthResult = { ok: true } | { ok: false; message: string };

const AuthContext = createContext<AuthState & {
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, fullName: string, role?: import('../types/api').Role) => Promise<AuthResult>;
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
      setUserState(null);
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
      setUserState(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.data?.accessToken) {
      localStorage.setItem(STORAGE_KEY, res.data.accessToken);
      setToken(res.data.accessToken);
      setUserState(res.data.user ?? null);
      return { ok: true };
    }
    const message = !res.success && 'message' in res ? res.message : 'Invalid email or password';
    return { ok: false, message };
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string, role?: import('../types/api').Role): Promise<AuthResult> => {
    try {
      const res = await api.auth.register({ email, password, fullName, role });
      if (!res.success) {
        const message = 'message' in res ? res.message : 'Registration failed. Please try again.';
        return { ok: false, message };
      }
      const raw = res as { data?: { user?: User; accessToken?: string; token?: string }; user?: User; accessToken?: string; token?: string };
      const data = raw.data ?? raw;
      let token = data.accessToken ?? data.token ?? raw.accessToken ?? raw.token;
      let user = data.user ?? raw.user;
      if (!token) {
        const loginRes = await api.auth.login({ email, password });
        if (loginRes.success && loginRes.data) {
          const loginData = loginRes.data as { user?: User; accessToken?: string; token?: string };
          token = loginData.accessToken ?? loginData.token;
          user = user ?? loginData.user;
        }
      }
      if (token) {
        localStorage.setItem(STORAGE_KEY, token);
        setToken(token);
        setUserState(user ?? null);
        return { ok: true };
      }
      return { ok: false, message: 'Registration failed. Please try again.' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error. Please try again.';
      return { ok: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore – still clear local state
    }
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUserState(null);
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
