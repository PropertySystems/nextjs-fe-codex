"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { API_BASE_URL, fetchWithError } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  full_name?: string | null;
  role?: string;
};

const TOKEN_STORAGE_KEY = "propertysystems.access_token";

type AuthContextState = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persistToken = useCallback((value: string | null) => {
    setToken(value);
    if (value) {
      localStorage.setItem(TOKEN_STORAGE_KEY, value);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const profile = await fetchWithError<AuthUser>(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(profile);
    } catch (error) {
      console.error("Failed to refresh user", error);
      setUser(null);
      persistToken(null);
    }
  }, [persistToken, token]);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken) {
      persistToken(storedToken);
    } else {
      setLoading(false);
    }
  }, [persistToken]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    refreshUser().finally(() => setLoading(false));
  }, [refreshUser, token]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const data = await fetchWithError<{ access_token: string }>(`${API_BASE_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        persistToken(data.access_token);
        await refreshUser();
      } finally {
        setLoading(false);
      }
    },
    [persistToken, refreshUser]
  );

  const register = useCallback(
    async (email: string, password: string, fullName?: string) => {
      setLoading(true);
      try {
        await fetchWithError(`${API_BASE_URL}/api/v1/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: fullName ?? null }),
        });

        await login(email, password);
      } finally {
        setLoading(false);
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    setUser(null);
    persistToken(null);
  }, [persistToken]);

  const value = useMemo(
    () => ({ user, token, loading, refreshUser, login, logout, register }),
    [loading, login, logout, refreshUser, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
