import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  joinedAt: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("mk_user");
    const storedToken = localStorage.getItem("mk_access_token");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("mk_user");
        localStorage.removeItem("mk_access_token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ name: "", email, password }),
      });
      
      const { access_token, user: apiUser } = response;
      localStorage.setItem("mk_access_token", access_token);
      
      const sessionUser: User = {
        id: apiUser.id,
        name: apiUser.name || email.split("@")[0],
        email: apiUser.email,
        role: "user",
        joinedAt: new Date().toISOString(),
      };
      
      localStorage.setItem("mk_user", JSON.stringify(sessionUser));
      setUser(sessionUser);
    } catch (error: any) {
      throw new Error(error.message || "Failed to log in.");
    }
  };

  const adminLogin = async (email: string, password: string) => {
    // For now, map admin login to regular login but flag as admin
    await login(email, password);
    setUser((prev) => {
      if (!prev) return null;
      const adminUser = { ...prev, role: "admin" as const };
      localStorage.setItem("mk_user", JSON.stringify(adminUser));
      return adminUser;
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      // Automatically login after successful registration
      await login(email, password);
    } catch (error: any) {
      throw new Error(error.message || "Failed to create account.");
    }
  };

  const logout = () => {
    localStorage.removeItem("mk_user");
    localStorage.removeItem("mk_access_token");
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    localStorage.setItem("mk_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === "admin",
        isAuthenticated: !!user,
        login,
        adminLogin,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
