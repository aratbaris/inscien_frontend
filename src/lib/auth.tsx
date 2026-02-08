"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  picture_url: string | null;
  created_at: string | null;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (next?: string) => void;
  logout: () => void;
  setTokens: (access: string, refresh: string) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  setTokens: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access || null;
  } catch {
    return null;
  }
}

async function fetchMe(accessToken: string): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("inscien_access");
    localStorage.removeItem("inscien_refresh");
    setUser(null);
  }, []);

  const setTokens = useCallback((access: string, refresh: string) => {
    localStorage.setItem("inscien_access", access);
    localStorage.setItem("inscien_refresh", refresh);
  }, []);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    let access = localStorage.getItem("inscien_access");
    const refresh = localStorage.getItem("inscien_refresh");

    if (!access && !refresh) {
      setIsLoading(false);
      return;
    }

    // Try fetching with current access token
    if (access) {
      const me = await fetchMe(access);
      if (me) {
        setUser(me);
        setIsLoading(false);
        return;
      }
    }

    // Access expired — try refresh
    if (refresh) {
      const newAccess = await refreshAccessToken(refresh);
      if (newAccess) {
        localStorage.setItem("inscien_access", newAccess);
        const me = await fetchMe(newAccess);
        if (me) {
          setUser(me);
          setIsLoading(false);
          return;
        }
      }
    }

    // Both failed — clear
    logout();
    setIsLoading(false);
  }, [logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Re-load user when tokens are set (after OAuth callback)
  const setTokensAndLoad = useCallback(
    (access: string, refresh: string) => {
      setTokens(access, refresh);
      loadUser();
    },
    [setTokens, loadUser]
  );

  const login = useCallback((next?: string) => {
    const params = next ? `?next=${encodeURIComponent(next)}` : "";
    window.location.href = `${API_BASE}/api/oauth/google/start${params}`;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        setTokens: setTokensAndLoad,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}