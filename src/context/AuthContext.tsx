import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { compterNonLues } from "@/lib/api";

type Role = "admin" | "membre" | null;

export type AuthUtilisateur = {
  id: number;
  role: Role;
  nom?: string | null;
  email?: string | null;
  photo_profil?: string | null;
  type_utilisateur?: string | null;
} | null;

type AuthContextType = {
  utilisateur: AuthUtilisateur;
  chargement: boolean;
  nonLues: number;
  connecter: (u: any) => void;
  deconnecter: () => void;
  mettreAJourProfil: (data: Partial<AuthUtilisateur>) => void;
  actualiserNonLues: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState<AuthUtilisateur>(null);
  const [chargement, setChargement] = useState(true);
  const [nonLues, setNonLues] = useState(0);
  const navigate = useNavigate();

  const actualiserNonLues = useCallback(async () => {
    const stored = localStorage.getItem("auth_user");
    const u = stored ? JSON.parse(stored) : null;
    if (u?.id) {
      const count = await compterNonLues(u.id).catch(() => 0);
      setNonLues(count);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUtilisateur(u);
        if (u?.id) compterNonLues(u.id).then(setNonLues).catch(() => {});
      } catch { setUtilisateur(null); }
    }
    setChargement(false);
  }, []);

  useEffect(() => {
    if (!utilisateur?.id) return;
    const interval = setInterval(() => {
      compterNonLues(utilisateur.id).then(setNonLues).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [utilisateur?.id]);

  const connecter = (u: any) => {
    const auth: AuthUtilisateur = {
      id: u.id,
      role: u.role,
      nom: u.nom ?? null,
      email: u.email ?? null,
      photo_profil: u.photo_profil ?? null,
      type_utilisateur: u.type_utilisateur ?? null,
    };
    setUtilisateur(auth);
    localStorage.setItem("auth_user", JSON.stringify(auth));
    if (u.id) compterNonLues(u.id).then(setNonLues).catch(() => {});
    if (u.role === "admin") navigate("/tableau-de-bord");
    else navigate("/livres");
  };

  const deconnecter = () => {
    setUtilisateur(null);
    setNonLues(0);
    localStorage.removeItem("auth_user");
    navigate("/connexion");
  };

  const mettreAJourProfil = (data: Partial<AuthUtilisateur>) => {
    setUtilisateur((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("auth_user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ utilisateur, chargement, nonLues, connecter, deconnecter, mettreAJourProfil, actualiserNonLues }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
