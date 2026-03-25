import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  obtenirReservations, creerReservation, modifierStatutReservation,
  obtenirUtilisateurs, obtenirLivres,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { CalendarClock, Plus, X, Search, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const STATUT: Record<string, { label: string; classe: string }> = {
  attente: { label: "En attente", classe: "status-attente" },
  pret:    { label: "Prête",      classe: "status-pret" },
  annule:  { label: "Annulée",    classe: "status-annule" },
  expire:  { label: "Expirée",    classe: "status-expire" },
};

// ── Compte à rebours pour la réservation prête ────────────────────────────────
function CompteAReboursResa({ dateLimite }: { dateLimite: string }) {
  const calculer = useCallback(() => {
    const diff = new Date(dateLimite).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, diff };
  }, [dateLimite]);

  const [temps, setTemps] = useState(calculer);
  useEffect(() => {
    const id = setInterval(() => setTemps(calculer()), 1000);
    return () => clearInterval(id);
  }, [calculer]);

  if (!temps) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg">
        <AlertTriangle className="h-3 w-3" /> Délai expiré
      </span>
    );
  }
  const urgence = temps.diff < 6 * 3600000;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
      urgence
        ? "text-red-400 bg-red-500/10 border-red-500/25 animate-pulse"
        : "text-amber-400 bg-amber-500/10 border-amber-500/25"
    }`}>
      <Clock className="h-3 w-3" />
      {String(temps.h).padStart(2, "0")}:{String(temps.m).padStart(2, "0")}:{String(temps.s).padStart(2, "0")}
    </span>
  );
}

export default function Reservations() {
  const { utilisateur } = useAuth();
  const [reservations, setReservations] = useState<any[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [livres, setLivres] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [afficherForm, setAfficherForm] = useState(false);
  const [membreId, setMembreId] = useState("");
  const [livreIdInput, setLivreIdInput] = useState("");
  const [livreFound, setLivreFound] = useState<any>(null);
  const [soumission, setSoumission] = useState(false);

  const charger = async () => {
    setChargement(true);
    try {
      const [rs, us, ls] = await Promise.all([obtenirReservations(), obtenirUtilisateurs(), obtenirLivres()]);
      setReservations(rs || []); setUtilisateurs(us || []); setLivres(ls || []);
    } finally { setChargement(false); }
  };

  useEffect(() => { charger(); }, []);

  useEffect(() => {
    if (!livreIdInput) { setLivreFound(null); return; }
    const id = parseInt(livreIdInput);
    setLivreFound(isNaN(id) ? null : livres.find((l: any) => l.id === id) || null);
  }, [livreIdInput, livres]);

  const handleCreer = async () => {
    const uid = utilisateur?.role === "admin" ? Number(membreId) : utilisateur?.id;
    if (!uid || !livreFound) { toast({ title: "Champs incomplets", variant: "destructive" }); return; }
    setSoumission(true);
    try {
      await creerReservation({ utilisateur_id: uid, livre_id: livreFound.id });
      toast({ title: "Réservation enregistrée" });
      setAfficherForm(false); setMembreId(""); setLivreIdInput(""); setLivreFound(null);
      charger();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setSoumission(false); }
  };

  const handleStatut = async (id: number, statut: string) => {
    try {
      await modifierStatutReservation(id, statut);
      toast({ title: "Statut mis à jour" });
      charger();
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const estAdmin = utilisateur?.role === "admin";
  const mesResas = estAdmin ? reservations : reservations.filter(r => String(r.utilisateur_id) === String(utilisateur?.id));

  return (
    <div className="space-y-5 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">{estAdmin ? "Réservations" : "Mes réservations"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{mesResas.length} réservation(s)</p>
        </div>
        <Button size="sm" onClick={() => setAfficherForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nouvelle réservation
        </Button>
      </motion.div>

      {/* Modal création */}
      <AnimatePresence>
        {afficherForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setAfficherForm(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="glass-card rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-display font-bold">Nouvelle réservation</h2>
                <button onClick={() => setAfficherForm(false)} className="h-8 w-8 rounded-lg hover:bg-card flex items-center justify-center">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                {estAdmin && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Membre</label>
                    <select value={membreId} onChange={e => setMembreId(e.target.value)}
                      className="w-full h-10 rounded-xl border border-border/70 bg-card/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                      <option value="">— Choisir un membre —</option>
                      {utilisateurs.filter(u => u.role === "membre").map(u => (
                        <option key={u.id} value={u.id}>{u.nom}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">ID du livre</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="ID du livre..." value={livreIdInput} onChange={e => setLivreIdInput(e.target.value)} className="pl-9 h-10" />
                  </div>
                  {livreFound && (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
                      {livreFound.couverture && <img src={livreFound.couverture} alt="" className="h-10 w-7 object-cover rounded" />}
                      <div>
                        <p className="text-sm font-semibold text-emerald-400">{livreFound.titre}</p>
                        <p className="text-xs text-emerald-400/70">{livreFound.exemplaires_disponibles} exemplaire(s) disponible(s)</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setAfficherForm(false)}>Annuler</Button>
                  <Button className="flex-1" onClick={handleCreer} disabled={soumission || !livreFound || (estAdmin && !membreId)}>
                    {soumission ? "Création..." : "Réserver"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste */}
      <div className="space-y-2">
        {chargement && [...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl animate-shimmer" />)}
        {!chargement && mesResas.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarClock className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucune réservation</p>
          </div>
        )}
        {mesResas.map((r, i) => {
          const cfg = STATUT[r.statut] || STATUT.attente;
          return (
            <motion.div key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="border-border/50 hover:border-primary/20 transition-all">
                <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <CalendarClock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{r.titre_livre}</p>
                      <p className="text-xs text-muted-foreground">{r.auteur_livre}</p>
                      {estAdmin && <p className="text-xs text-primary">{r.nom_utilisateur}</p>}
                    </div>
                  </div>

                  <div className="hidden sm:block text-xs text-muted-foreground shrink-0">
                    <p className="text-[10px] uppercase tracking-wider">Réservé le</p>
                    <p className="font-medium text-foreground">{new Date(r.date_creation).toLocaleDateString("fr-FR")}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.classe}`}>{cfg.label}</span>

                    {/* Compte à rebours pour "pret" */}
                    {r.statut === "pret" && r.date_limite_retrait && (
                      <CompteAReboursResa dateLimite={r.date_limite_retrait} />
                    )}

                    {estAdmin && r.statut === "attente" && (
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1"
                        onClick={() => handleStatut(r.id, "pret")}>
                        <CheckCircle className="h-3 w-3" /> Disponible
                      </Button>
                    )}
                    {estAdmin && (r.statut === "attente" || r.statut === "pret") && (
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-destructive hover:text-destructive"
                        onClick={() => handleStatut(r.id, "annule")}>
                        <XCircle className="h-3 w-3" /> Annuler
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
