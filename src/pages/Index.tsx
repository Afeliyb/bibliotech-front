import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Users, ArrowLeftRight, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { obtenirStats, obtenirEmprunts, obtenirLivres } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

function StatCard({ titre, valeur, icone: Icon, couleur, chargement }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-border/50 glass-card overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{titre}</p>
              <p className="text-3xl font-display font-bold mt-1">
                {chargement ? <span className="text-muted-foreground">...</span> : valeur}
              </p>
            </div>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${couleur}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function TableauDeBord() {
  const { utilisateur } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [emprunts, setEmprunts] = useState<any[]>([]);
  const [livresRecents, setLivresRecents] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);
    Promise.all([obtenirStats(), obtenirEmprunts(), obtenirLivres()])
      .then(([s, es, ls]) => {
        setStats(s);
        setEmprunts((es || []).filter((e: any) => !e.retourne).slice(0, 5));
        setLivresRecents((ls || []).slice(-4).reverse());
      })
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  if (utilisateur?.role !== "admin") {
    return (
      <div className="space-y-5 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold">
            Bonjour{utilisateur?.nom ? `, ${utilisateur.nom.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Utilisez le menu pour accéder au catalogue, vos emprunts et réservations.
          </p>
        </motion.div>
        <Card className="glass-card border-border/50 p-6">
          <p className="text-sm text-muted-foreground text-center">
            Rendez-vous dans <strong className="text-foreground">Ma bibliothèque</strong> pour consulter les informations, horaires et règles.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de la bibliothèque</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { titre: "Livres", valeur: stats?.total_livres ?? "—", icone: BookOpen, couleur: "bg-primary/15 text-primary" },
          { titre: "Membres", valeur: stats?.total_membres ?? "—", icone: Users, couleur: "bg-accent/15 text-accent" },
          { titre: "Actifs", valeur: stats?.emprunts_actifs ?? "—", icone: ArrowLeftRight, couleur: "bg-emerald-500/15 text-emerald-400" },
          { titre: "Retards", valeur: stats?.retards ?? "—", icone: Clock, couleur: "bg-red-500/15 text-red-400" },
          { titre: "Pénalités", valeur: stats?.penalites_impayees ?? "—", icone: AlertTriangle, couleur: "bg-orange-500/15 text-orange-400" },
          { titre: "Réservations", valeur: stats?.reservations_en_attente ?? "—", icone: TrendingUp, couleur: "bg-purple-500/15 text-purple-400" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="border-border/50 glass-card">
              <CardContent className="p-4">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${s.couleur}`}>
                  <s.icone className="h-4 w-4" />
                </div>
                <p className="text-2xl font-display font-bold">{chargement ? "..." : s.valeur}</p>
                <p className="text-xs text-muted-foreground">{s.titre}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emprunts actifs */}
        <div>
          <h2 className="text-base font-display font-semibold mb-3">Emprunts actifs</h2>
          <div className="space-y-2">
            {chargement && [...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-xl animate-shimmer" />)}
            {!chargement && emprunts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Aucun emprunt actif</p>
            )}
            {emprunts.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`border-border/40 ${e.statut === "retard" ? "border-red-500/20" : ""}`}>
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{e.titre_livre}</p>
                      <p className="text-xs text-primary truncate"> {e.nom_utilisateur}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium shrink-0 ${e.statut === "retard" ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                      {e.statut === "retard" ? "En retard" : "En cours"}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Livres récents */}
        <div>
          <h2 className="text-base font-display font-semibold mb-3">Livres récents</h2>
          <div className="grid grid-cols-2 gap-3">
            {chargement && [...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl animate-shimmer" />)}
            {livresRecents.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}>
                <Card className="border-border/40 glass-card overflow-hidden">
                  <CardContent className="p-0">
                    {l.couverture && (
                      <img src={l.couverture} alt={l.titre} className="w-full h-24 object-cover" />
                    )}
                    <div className="p-2.5">
                      <p className="text-xs font-semibold truncate">{l.titre}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{l.auteur}</p>
                      <p className="text-[10px] text-primary mt-0.5">{l.exemplaires_disponibles}/{l.total_exemplaires} dispo</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
