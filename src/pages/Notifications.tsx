import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { obtenirNotifications, marquerNotificationLue, toutMarquerLues } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Bell, BookOpen, ArrowLeftRight, CalendarClock, AlertTriangle, CheckCheck, RefreshCw, ShieldAlert, Clock } from "lucide-react";

const TYPE_CONFIG: Record<string, { icone: React.ElementType; classes: string; etiquette: string }> = {
  emprunt:       { icone: ArrowLeftRight, classes: "text-blue-400 bg-blue-400/10",    etiquette: "Emprunt" },
  retour:        { icone: BookOpen,       classes: "text-emerald-400 bg-emerald-400/10", etiquette: "Retour" },
  reservation:   { icone: CalendarClock,  classes: "text-purple-400 bg-purple-400/10",  etiquette: "Réservation" },
  penalite:      { icone: AlertTriangle,  classes: "text-red-400 bg-red-400/10",        etiquette: "Pénalité" },
  avertissement: { icone: ShieldAlert,    classes: "text-orange-400 bg-orange-400/10",  etiquette: "Avertissement" },
  rappel:        { icone: Clock,          classes: "text-amber-400 bg-amber-400/10",    etiquette: "Rappel" },
  info:          { icone: Bell,           classes: "text-primary bg-primary/10",        etiquette: "Info" },
};

function ilYA(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Il y a ${d} jour${d > 1 ? "s" : ""}`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function Notifications() {
  const { utilisateur, actualiserNonLues } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);

  const charger = async () => {
    if (!utilisateur?.id) return;
    setChargement(true);
    const data = await obtenirNotifications(utilisateur.id).catch(() => []);
    setNotes(data || []);
    setChargement(false);
  };

  useEffect(() => { charger(); }, [utilisateur?.id]);

  const marquerLue = async (id: number) => {
    await marquerNotificationLue(id).catch(() => {});
    setNotes(s => s.map(n => n.id === id ? { ...n, lue: true } : n));
    actualiserNonLues();
  };

  const toutLire = async () => {
    if (!utilisateur?.id) return;
    await toutMarquerLues(utilisateur.id).catch(() => {});
    setNotes(s => s.map(n => ({ ...n, lue: true })));
    actualiserNonLues();
  };

  const nonLues = notes.filter(n => !n.lue).length;

  return (
    <div className="space-y-5 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold">Notifications</h1>
            {nonLues > 0 && (
              <span className="h-6 min-w-6 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {nonLues}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {chargement ? "Chargement..." : `${notes.length} notification${notes.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={charger} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Actualiser
          </Button>
          {nonLues > 0 && (
            <Button size="sm" variant="outline" onClick={toutLire} className="gap-2">
              <CheckCheck className="h-3.5 w-3.5" /> Tout marquer lu
            </Button>
          )}
        </div>
      </motion.div>

      <div className="space-y-2">
        {chargement && [...Array(4)].map((_, i) => <div key={i} className="h-18 rounded-xl animate-shimmer" style={{height:"72px"}} />)}

        {!chargement && notes.length === 0 && (
          <div className="text-center py-16">
            <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune notification pour le moment</p>
          </div>
        )}

        <AnimatePresence>
          {notes.map((n: any, i: number) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
            const Icone = cfg.icone;
            return (
              <motion.div key={n.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.025 }} layout>
                <Card className={`border-border/50 transition-all ${!n.lue ? "bg-card border-primary/10" : "opacity-55 bg-card/40"}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.classes}`}>
                      <Icone className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {n.titre && (
                        <p className={`text-xs font-semibold mb-0.5 ${!n.lue ? "text-foreground" : "text-muted-foreground"}`}>
                          {n.titre}
                        </p>
                      )}
                      <p className={`text-sm leading-relaxed ${!n.lue ? "" : "text-muted-foreground"}`}>{n.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{cfg.etiquette}</span>
                        <span className="text-[10px] text-muted-foreground/60">·</span>
                        <span className="text-xs text-muted-foreground/60">{ilYA(n.date_creation)}</span>
                        {!n.lue && <span className="h-1.5 w-1.5 rounded-full bg-primary ml-1" />}
                      </div>
                    </div>
                    {!n.lue && (
                      <button onClick={() => marquerLue(n.id)}
                        className="text-xs text-primary hover:text-primary/80 transition-colors shrink-0 underline">
                        Lu
                      </button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
