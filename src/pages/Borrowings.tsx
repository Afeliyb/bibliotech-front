import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeftRight, RotateCcw, Plus, X, Search,
  Download, Calendar, Filter, Clock, CheckCircle2, AlertTriangle,
} from "lucide-react";
import {
  obtenirEmprunts, retournerLivre, creerEmprunt,
  obtenirUtilisateurs, obtenirLivres, confirmerRetraitEmprunt,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const STATUT_CONFIG: Record<string, { label: string; classe: string }> = {
  actif:           { label: "En cours",          classe: "status-actif" },
  retard:          { label: "En retard",          classe: "status-retard" },
  retourne:        { label: "Retourné",           classe: "status-retourne" },
  attente_retrait: { label: "À récupérer",        classe: "status-attente" },
  annule:          { label: "Annulé",             classe: "status-annule" },
};

function formaterDate(str: string | null | undefined) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Compte à rebours 24h ──────────────────────────────────────────────────────
function CompteARebours({ dateLimite }: { dateLimite: string }) {
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

  const urgence = temps.diff < 6 * 3600000; // moins de 6h
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
      urgence
        ? "text-red-400 bg-red-500/10 border-red-500/25 animate-pulse"
        : "text-amber-400 bg-amber-500/10 border-amber-500/25"
    }`}>
      <Clock className="h-3 w-3 shrink-0" />
      {String(temps.h).padStart(2, "0")}:{String(temps.m).padStart(2, "0")}:{String(temps.s).padStart(2, "0")}
    </span>
  );
}

function exporterPDF(emprunts: any[], debut: string, fin: string) {
  const lignes = emprunts.map(e => `
    <tr>
      <td>${e.id}</td>
      <td>${e.nom_utilisateur}</td>
      <td>${e.titre_livre}</td>
      <td>${formaterDate(e.date_emprunt)}</td>
      <td>${formaterDate(e.date_retour_prevu)}</td>
      <td>${e.retourne ? "Retourné" : e.statut === "retard" ? "En retard" : e.statut === "attente_retrait" ? "À récupérer" : "En cours"}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Rapport d'emprunts</title>
<style>
  body{font-family:Arial,sans-serif;font-size:12px;margin:20px;color:#111}
  h1{font-size:18px;margin-bottom:4px}
  p{color:#666;margin-bottom:16px}
  table{width:100%;border-collapse:collapse}
  th{background:#1a1a2e;color:white;padding:8px;text-align:left;font-size:11px}
  td{padding:7px 8px;border-bottom:1px solid #eee;font-size:11px}
  tr:nth-child(even){background:#f8f9fa}
  .footer{margin-top:20px;color:#999;font-size:10px;text-align:center}
</style></head>
<body>
  <h1>Rapport d'emprunts — BiblioTech</h1>
  <p>Période : ${debut || "—"} → ${fin || "—"} | Généré le ${new Date().toLocaleDateString("fr-FR")}</p>
  <table>
    <thead><tr><th>#</th><th>Membre</th><th>Livre</th><th>Emprunté le</th><th>Échéance</th><th>Statut</th></tr></thead>
    <tbody>${lignes}</tbody>
  </table>
  <div class="footer">BiblioTech — Système de gestion de bibliothèque © 2026</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (w) {
    w.onload = () => { w.print(); };
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

export default function Emprunts() {
  const { utilisateur } = useAuth();
  const [emprunts, setEmprunts] = useState<any[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [tousLivres, setTousLivres] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [afficherForm, setAfficherForm] = useState(false);
  const [filtre, setFiltre] = useState("tous");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  // Formulaire (admin)
  const [membreId, setMembreId] = useState("");
  const [livreIdInput, setLivreIdInput] = useState("");
  const [livreFound, setLivreFound] = useState<any>(null);
  const [dureeJours, setDureeJours] = useState(14);
  const [maxJours] = useState(14);
  const [soumission, setSoumission] = useState(false);

  const charger = async () => {
    setChargement(true);
    try {
      const [es, us, ls] = await Promise.all([
        obtenirEmprunts(dateDebut || undefined, dateFin || undefined),
        obtenirUtilisateurs(),
        obtenirLivres(),
      ]);
      setEmprunts(es || []);
      setUtilisateurs(us || []);
      setTousLivres(ls || []);
    } catch { setEmprunts([]); }
    finally { setChargement(false); }
  };

  useEffect(() => { charger(); }, [dateDebut, dateFin]);

  useEffect(() => {
    if (!livreIdInput.trim()) { setLivreFound(null); return; }
    const id = parseInt(livreIdInput);
    if (isNaN(id)) { setLivreFound(null); return; }
    setLivreFound(tousLivres.find((l: any) => l.id === id) || null);
  }, [livreIdInput, tousLivres]);

  const handleRetour = async (id: number) => {
    try {
      await retournerLivre(id);
      toast({ title: "Retour enregistré" });
      charger();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleConfirmerRetrait = async (id: number) => {
    try {
      await confirmerRetraitEmprunt(id);
      toast({ title: "Récupération confirmée", description: "L'emprunt est maintenant actif." });
      charger();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleCreer = async () => {
    if (!membreId || !livreFound) {
      toast({ title: "Champs incomplets", variant: "destructive" });
      return;
    }
    setSoumission(true);
    try {
      const retour = new Date();
      retour.setDate(retour.getDate() + dureeJours);
      await creerEmprunt({
        utilisateur_id: Number(membreId),
        livre_id: livreFound.id,
        date_retour_prevu: retour.toISOString().split("T")[0],
        en_ligne: false,
      });
      toast({ title: "Emprunt créé", description: `« ${livreFound.titre} » — retour le ${retour.toLocaleDateString("fr-FR")}` });
      setAfficherForm(false);
      setMembreId(""); setLivreIdInput(""); setLivreFound(null);
      charger();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setSoumission(false); }
  };

  const estAdmin = utilisateur?.role === "admin";
  const mesEmprunts = estAdmin ? emprunts : emprunts.filter(e => String(e.utilisateur_id) === String(utilisateur?.id));
  const affiches = filtre === "tous" ? mesEmprunts : mesEmprunts.filter(e => e.statut === filtre);

  const comptes = {
    tous: mesEmprunts.length,
    actif: mesEmprunts.filter(e => e.statut === "actif").length,
    attente_retrait: mesEmprunts.filter(e => e.statut === "attente_retrait").length,
    retard: mesEmprunts.filter(e => e.statut === "retard").length,
    retourne: mesEmprunts.filter(e => e.statut === "retourne").length,
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">{estAdmin ? "Emprunts" : "Mes emprunts"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {chargement ? "Chargement..." : `${comptes.tous} emprunt(s) — ${comptes.actif} actif(s)${comptes.attente_retrait > 0 ? `, ${comptes.attente_retrait} à récupérer` : ""}${comptes.retard > 0 ? `, ${comptes.retard} en retard` : ""}`}
          </p>
        </div>
        <div className="flex gap-2">
          {estAdmin && (
            <>
              <Button variant="outline" size="sm" className="gap-2"
                onClick={() => exporterPDF(affiches, dateDebut, dateFin)}>
                <Download className="h-3.5 w-3.5" /> Exporter PDF
              </Button>
              <Button size="sm" onClick={() => setAfficherForm(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Nouvel emprunt
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Filtres date (admin) */}
      {estAdmin && (
        <div className="glass-card rounded-xl p-4 flex flex-wrap gap-3 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <label className="text-xs text-muted-foreground">Du</label>
            <Input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="h-8 w-36 text-xs" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Au</label>
            <Input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="h-8 w-36 text-xs" />
          </div>
          {(dateDebut || dateFin) && (
            <button onClick={() => { setDateDebut(""); setDateFin(""); }}
              className="text-xs text-muted-foreground hover:text-foreground underline">
              Effacer
            </button>
          )}
        </div>
      )}

      {/* Filtres statut */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "tous",           label: `Tous (${comptes.tous})` },
          { key: "actif",          label: `En cours (${comptes.actif})` },
          { key: "attente_retrait",label: `À récupérer (${comptes.attente_retrait})` },
          { key: "retard",         label: `En retard (${comptes.retard})` },
          { key: "retourne",       label: `Retournés (${comptes.retourne})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltre(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${filtre === f.key ? "bg-primary/15 text-primary border-primary/30" : "border-border/50 text-muted-foreground hover:border-primary/20"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Modal création emprunt (admin) */}
      <AnimatePresence>
        {afficherForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setAfficherForm(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="glass-card rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-display font-bold">Créer un emprunt</h2>
                <button onClick={() => setAfficherForm(false)} className="h-8 w-8 rounded-lg hover:bg-card flex items-center justify-center">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Membre</label>
                  <select value={membreId} onChange={e => setMembreId(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border/70 bg-card/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="">— Choisir un membre —</option>
                    {utilisateurs.filter(u => u.role === "membre").map(u => (
                      <option key={u.id} value={u.id}>{u.nom} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">ID du livre</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Saisir l'ID..." value={livreIdInput} onChange={e => setLivreIdInput(e.target.value)} className="pl-9 h-10" />
                  </div>
                  {livreIdInput && (
                    <div className={`mt-2 p-2.5 rounded-xl text-sm flex items-center gap-3 border ${livreFound ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-red-500/10 border-red-500/25 text-red-400"}`}>
                      {livreFound ? (
                        <>
                          {livreFound.couverture && <img src={livreFound.couverture} alt="" className="h-10 w-7 object-cover rounded" />}
                          <div>
                            <p className="font-semibold">{livreFound.titre}</p>
                            <p className="text-xs opacity-75">{livreFound.auteur} — {livreFound.exemplaires_disponibles}/{livreFound.total_exemplaires} dispo</p>
                          </div>
                        </>
                      ) : <p>Aucun livre trouvé avec l'ID {livreIdInput}</p>}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-semibold text-muted-foreground">Durée</label>
                    <span className="text-xs font-bold text-primary">{dureeJours} jour(s)</span>
                  </div>
                  <input type="range" min={1} max={maxJours} value={dureeJours}
                    onChange={e => setDureeJours(parseInt(e.target.value))}
                    className="w-full accent-primary" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Retour le {new Date(Date.now() + dureeJours * 86400000).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex gap-3 pt-1">
                  <Button variant="outline" className="flex-1" onClick={() => setAfficherForm(false)}>Annuler</Button>
                  <Button className="flex-1" onClick={handleCreer} disabled={soumission || !livreFound || !membreId}>
                    {soumission ? "Création..." : "Créer"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des emprunts */}
      <div className="space-y-2">
        {chargement && [...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl animate-shimmer" />
        ))}
        {!chargement && affiches.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucun emprunt trouvé</p>
          </div>
        )}
        {affiches.map((e, i) => {
          const cfg = STATUT_CONFIG[e.statut] || STATUT_CONFIG.actif;
          const estEnAttenteRetrait = e.statut === "attente_retrait";
          const estAnnule = e.statut === "annule";
          return (
            <motion.div key={e.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}>
              <Card className={`border-border/50 hover:border-primary/20 transition-all ${
                e.statut === "retard" ? "border-red-500/20" :
                estEnAttenteRetrait ? "border-amber-500/20" :
                estAnnule ? "opacity-60" : ""
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        e.statut === "retard" ? "bg-red-500/10" :
                        estEnAttenteRetrait ? "bg-amber-500/10" :
                        "bg-primary/10"
                      }`}>
                        <ArrowLeftRight className={`h-4 w-4 ${
                          e.statut === "retard" ? "text-red-400" :
                          estEnAttenteRetrait ? "text-amber-400" :
                          "text-primary"
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{e.titre_livre}</p>
                        <p className="text-xs text-muted-foreground">{e.auteur_livre}</p>
                        {estAdmin && <p className="text-xs text-primary mt-0.5">{e.nom_utilisateur}</p>}
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-5 text-xs text-muted-foreground shrink-0">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider">Emprunté</p>
                        <p className="font-medium text-foreground">{formaterDate(e.date_emprunt)}</p>
                      </div>
                      {!estEnAttenteRetrait && !estAnnule && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider">Échéance</p>
                          <p className={`font-medium ${e.statut === "retard" ? "text-red-400" : "text-foreground"}`}>
                            {formaterDate(e.date_retour_prevu)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.classe}`}>{cfg.label}</span>

                      {/* Compte à rebours 24h pour les emprunts en attente de retrait */}
                      {estEnAttenteRetrait && e.date_limite_retrait && (
                        <CompteARebours dateLimite={e.date_limite_retrait} />
                      )}

                      {/* Bouton confirmer retrait (admin) */}
                      {estEnAttenteRetrait && estAdmin && (
                        <Button size="sm" variant="outline"
                          className="h-8 text-xs gap-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                          onClick={() => handleConfirmerRetrait(e.id)}>
                          <CheckCircle2 className="h-3 w-3" /> Confirmer retrait
                        </Button>
                      )}

                      {/* Bouton retourner (admin) */}
                      {e.statut !== "retourne" && !estAnnule && !estEnAttenteRetrait && estAdmin && (
                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => handleRetour(e.id)}>
                          <RotateCcw className="h-3 w-3" /> Retourner
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Bandeau informatif pour emprunt en ligne */}
                  {estEnAttenteRetrait && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                      <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>
                        Emprunt en attente de récupération — présentez-vous à la bibliothèque avant l'expiration du délai.
                        {estAdmin && " Cliquez sur « Confirmer retrait » lorsque le membre récupère physiquement le livre."}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
