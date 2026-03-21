/**
 * Auth state and actions. Supports two account types (company | user) per docs/AUTH_MODEL.md.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Company, AccountType } from '../types/api';
import * as api from '../api/client';

const STORAGE_KEY = 'accessToken';
const ACCOUNT_TYPE_KEY = 'accountType';

type AuthState = {
  user: User | null;
  company: Company | null;
  accountType: AccountType | null;
  loading: boolean;
  token: string | null;
};

export type AuthResult =
  | { ok: true; accountType: AccountType; user: User | null; company: Company | null }
  | { ok: false; message: string };

const AuthContext = createContext<AuthState & {
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, companyName: string, logo?: File) => Promise<AuthResult>;
  logout: () => void;
  setUser: (u: User | null) => void;
  setCompany: (c: Company | null) => void;
} | null>(null);

function parseAuthResponse(raw: Record<string, unknown>): { token: string | undefined; accountType: AccountType | undefined; user: User | undefined; company: Company | undefined } {
  const data = (raw.data ?? raw) as Record<string, unknown>;
  const token = (data.accessToken ?? data.token ?? raw.accessToken ?? raw.token) as string | undefined;
  const accountType = (data.type ?? raw.type) as AccountType | undefined;
  const user = (data.user ?? raw.user) as User | undefined;
  const company = (data.company ?? raw.company) as Company | undefined;
  return { token, accountType, user, company };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [company, setCompanyState] = useState<Company | null>(null);
  const [accountType, setAccountTypeState] = useState<AccountType | null>(() =>
    (localStorage.getItem(ACCOUNT_TYPE_KEY) as AccountType | null) || null
  );
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  const setUser = useCallback((u: User | null) => setUserState(u), []);
  const setCompany = useCallback((c: Company | null) => setCompanyState(c), []);

  /** Never keep both entities populated — avoids reading `user.role` on a company JWT session (stale user). */
  const applyAuth = useCallback((t: string, type: AccountType, u: User | null, c: Company | null) => {
    localStorage.setItem(STORAGE_KEY, t);
    localStorage.setItem(ACCOUNT_TYPE_KEY, type);
    setToken(t);
    setAccountTypeState(type);
    if (type === 'company') {
      setUserState(null);
      setCompanyState(c);
    } else {
      setUserState(u);
      setCompanyState(null);
    }
  }, []);

  const fetchMe = useCallback(async () => {
    const t = localStorage.getItem(STORAGE_KEY);
    if (!t) {
      setUserState(null);
      setCompanyState(null);
      setAccountTypeState(null);
      setToken(null);
      setLoading(false);
      return;
    }
    setToken(t);
    const res = await api.auth.me();
    const raw = res as unknown as Record<string, unknown>;
    if (raw.success === false) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACCOUNT_TYPE_KEY);
      setToken(null);
      setUserState(null);
      setCompanyState(null);
      setAccountTypeState(null);
      setLoading(false);
      return;
    }
    const data = (raw.data ?? raw) as Record<string, unknown>;
    const type = (data.type ?? raw.type) as AccountType | undefined;
    const u = (data.user ?? raw.user) as User | undefined;
    const c = (data.company ?? raw.company) as Company | undefined;
    if (type) {
      setAccountTypeState(type);
      localStorage.setItem(ACCOUNT_TYPE_KEY, type);
    }
    if (type === 'company') {
      setUserState(null);
      setCompanyState(c ?? null);
    } else if (type === 'user') {
      setUserState(u ?? null);
      setCompanyState(null);
    } else {
      setUserState(u ?? null);
      setCompanyState(c ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchMe();
    });
  }, [fetchMe]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const res = await api.auth.login({ email, password });
    const raw = res as unknown as Record<string, unknown>;
    if (raw.success === false) {
      const message = (raw.message as string) || 'Invalid email or password';
      return { ok: false, message };
    }
    const { token: t, accountType: type, user: u, company: c } = parseAuthResponse(raw);
    if (t && type) {
      const userVal = u ?? null;
      const companyVal = c ?? null;
      applyAuth(t, type, userVal, companyVal);
      return { ok: true, accountType: type, user: userVal, company: companyVal };
    }
    return { ok: false, message: 'Invalid response from server.' };
  }, [applyAuth]);

  const register = useCallback(async (email: string, password: string, companyName: string, logo?: File): Promise<AuthResult> => {
    try {
      const res = await api.auth.register({ email, password, companyName }, logo);
      const raw = res as unknown as Record<string, unknown>;
      if (raw.success === false) {
        const message = (raw.message as string) || 'Registration failed. Please try again.';
        return { ok: false, message };
      }
      const loginRes = await api.auth.login({ email, password });
      const loginRaw = loginRes as unknown as Record<string, unknown>;
      if (loginRaw.success === false) {
        return { ok: false, message: 'Account created. Please sign in.' };
      }
      const { token: t, accountType: type, user: u, company: c } = parseAuthResponse(loginRaw);
      if (t && type) {
        const userVal = u ?? null;
        const companyVal = c ?? null;
        applyAuth(t, type, userVal, companyVal);
        return { ok: true, accountType: type, user: userVal, company: companyVal };
      }
      return { ok: false, message: 'Account created. Please sign in.' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error. Please try again.';
      return { ok: false, message };
    }
  }, [applyAuth]);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACCOUNT_TYPE_KEY);
    setToken(null);
    setAccountTypeState(null);
    setUserState(null);
    setCompanyState(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        accountType,
        loading,
        token,
        login,
        register,
        logout,
        setUser,
        setCompany,
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
