import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "../types/health.js";

interface AuthContextType {
  user: UserProfile | null;
  activeProfileKey: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  switchProfile: (profileKey: string) => Promise<void>;
  resetDemo: () => Promise<void>;
  login: (email: string) => Promise<void>;
  register: (name: string, email: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  activeProfileKey: "rajesh",
  isAuthenticated: true,
  isLoading: false,
  switchProfile: async () => {},
  resetDemo: async () => {},
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeProfileKey, setActiveProfileKey] = useState<string>("rajesh");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setActiveProfileKey(data.activeProfileKey || "rajesh");
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error("Failed to load user:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const switchProfile = async (profileKey: string) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileKey }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setActiveProfileKey(data.activeProfileKey);
      }
    } catch (e) {
      console.error("Failed to switch demo profile:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const resetDemo = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/demo-reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setActiveProfileKey("rajesh");
      }
    } catch (e) {
      console.error("Failed to reset demo:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeProfileKey,
        isAuthenticated,
        isLoading,
        switchProfile,
        resetDemo,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
