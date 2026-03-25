const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Erreur ${res.status}`);
  }
  return res.json();
}

export const obtenirStats = () => api<any>("/stats");
export const obtenirInfoBibliotheque = () => api<any>("/info-bibliotheque");

export const seConnecter = (email: string, motDePasse: string) =>
  api<any>("/auth/connexion", { method: "POST", body: JSON.stringify({ email, mot_de_passe: motDePasse }) });

export const sInscrire = (payload: any) =>
  api<any>("/auth/inscription", { method: "POST", body: JSON.stringify(payload) });

export const obtenirLivres = () => api<any[]>("/livres");
export const obtenirLivre = (id: number) => api<any>(`/livres/${id}`);
export const creerLivre = (payload: any) => api<any>("/livres", { method: "POST", body: JSON.stringify(payload) });
export const modifierLivre = (id: number, payload: any) => api<any>(`/livres/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const supprimerLivre = (id: number) => api<any>(`/livres/${id}`, { method: "DELETE" });
export const ajouterExemplaires = (id: number, nombre: number) =>
  api<any>(`/livres/${id}/exemplaires`, { method: "POST", body: JSON.stringify({ nombre }) });

export const obtenirUtilisateurs = () => api<any[]>("/utilisateurs");
export const modifierUtilisateur = (id: number, payload: any) =>
  api<any>(`/utilisateurs/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const supprimerUtilisateur = (id: number) => api<any>(`/utilisateurs/${id}`, { method: "DELETE" });

export const obtenirEmprunts = (dateDebut?: string, dateFin?: string) => {
  const params = new URLSearchParams();
  if (dateDebut) params.append("date_debut", dateDebut);
  if (dateFin) params.append("date_fin", dateFin);
  const qs = params.toString();
  return api<any[]>(`/emprunts${qs ? "?" + qs : ""}`);
};
export const creerEmprunt = (payload: any) =>
  api<any>("/emprunts", { method: "POST", body: JSON.stringify(payload) });
export const retournerLivre = (id: number) =>
  api<any>(`/emprunts/${id}/retourner`, { method: "PUT" });
export const confirmerRetraitEmprunt = (id: number) =>
  api<any>(`/emprunts/${id}/confirmer-retrait`, { method: "PUT" });

export const obtenirReservations = () => api<any[]>("/reservations");
export const creerReservation = (payload: any) =>
  api<any>("/reservations", { method: "POST", body: JSON.stringify(payload) });
export const modifierStatutReservation = (id: number, statut: string) =>
  api<any>(`/reservations/${id}/statut`, { method: "PUT", body: JSON.stringify({ statut }) });

export const obtenirPenalites = (utilisateurId?: number) => {
  const url = utilisateurId ? `/penalites?utilisateur_id=${utilisateurId}` : "/penalites";
  return api<any[]>(url);
};
export const payerPenalite = (id: number) => api<any>(`/penalites/${id}/payer`, { method: "PUT" });

export const obtenirNotifications = (utilisateurId: number) =>
  api<any[]>(`/notifications?utilisateur_id=${utilisateurId}`);
export const compterNonLues = async (utilisateurId: number): Promise<number> => {
  const data = await api<any>(`/notifications/non-lues?utilisateur_id=${utilisateurId}`);
  return data.total ?? 0;
};
export const marquerNotificationLue = (id: number) =>
  api<any>(`/notifications/${id}/lire`, { method: "PUT" });
export const toutMarquerLues = (utilisateurId: number) =>
  api<any>("/notifications/tout-lire", { method: "PUT", body: JSON.stringify({ utilisateur_id: utilisateurId }) });

export const obtenirParametres = () => api<any>("/admin/parametres");
export const sauvegarderParametres = (payload: any) =>
  api<any>("/admin/parametres", { method: "POST", body: JSON.stringify(payload) });
export const obtenirCodesAcces = () => api<any[]>("/admin/codes-acces");
export const genererCodesAcces = (nombre: number) =>
  api<any>("/admin/codes-acces/generer", { method: "POST", body: JSON.stringify({ nombre }) });
export const diffuserNotification = (titre: string, message: string, type_notif = "info") =>
  api<any>("/admin/notifications/diffuser", { method: "POST", body: JSON.stringify({ titre, message, type_notif }) });
export const declencherVerification = () =>
  api<any>("/admin/scheduler/verifier-retards", { method: "POST" });
