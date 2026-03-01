import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUnreadCount } from "@/lib/api";

type Role = "admin" | "member" | null;

export type AuthUser = {
  id: number;
  role: Role;
  name?: string | null;
  email?: string | null;
  profile_picture?: string | null;
} | null;

type AuthContextType = {
  user: AuthUser;
  loading: boolean;
  unreadCount: number;
  login: (user: { id: number; role: Role; name?: string; email?: string; profile_picture?: string }) => void;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
  refreshUnread: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const refreshUnread = useCallback(async () => {
    const stored = localStorage.getItem("auth_user");
    const u = stored ? JSON.parse(stored) : null;
    if (u?.id) {
      const count = await getUnreadCount(u.id).catch(() => 0);
      setUnreadCount(count);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        if (u?.id) {
          getUnreadCount(u.id).then(setUnreadCount).catch(() => {});
        }
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // Poll unread count every 30s
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      getUnreadCount(user.id).then(setUnreadCount).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const login = (u: { id: number; role: Role; name?: string; email?: string; profile_picture?: string }) => {
    const auth: AuthUser = {
      id: u.id,
      role: u.role,
      name: u.name ?? null,
      email: u.email ?? null,
      profile_picture: u.profile_picture ?? null,
    };
    setUser(auth);
    localStorage.setItem("auth_user", JSON.stringify(auth));
    if (u.id) getUnreadCount(u.id).then(setUnreadCount).catch(() => {});
    if (u.role === "admin") navigate("/dashboard");
    else navigate("/books");
  };

  const logout = () => {
    setUser(null);
    setUnreadCount(0);
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

  const updateProfile = (data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("auth_user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, unreadCount, login, logout, updateProfile, refreshUnread }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
