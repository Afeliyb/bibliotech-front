import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getNotifications, markNotificationRead, markAllNotificationsRead, getUsers } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Bell, BookOpen, ArrowLeftRight, CalendarClock, AlertTriangle, CheckCheck, RefreshCw } from "lucide-react";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  borrow:      { icon: ArrowLeftRight, color: "text-blue-400 bg-blue-400/10",      label: "Emprunt" },
  return:      { icon: BookOpen,       color: "text-green-400 bg-green-400/10",    label: "Retour" },
  reservation: { icon: CalendarClock,  color: "text-purple-400 bg-purple-400/10",  label: "Réservation" },
  penalty:     { icon: AlertTriangle,  color: "text-red-400 bg-red-400/10",        label: "Pénalité" },
  info:        { icon: Bell,           color: "text-primary bg-primary/10",        label: "Info" },
};

const getTypeConfig = (type: string) => TYPE_CONFIG[type] ?? TYPE_CONFIG.info;

function timeAgo(dateStr: string) {
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
  const { user, refreshUnread } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [userId, setUserId] = useState<number | null>(user?.id ?? null);

  const load = async (uid: number) => {
    const data = await getNotifications(uid).catch(() => []);
    setNotes(data || []);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const doLoad = async () => {
      let uid = userId;
      if (!uid && user?.email) {
        const users = await getUsers().catch(() => []);
        const me = users.find((u: any) => u.email === user.email);
        if (me) { uid = me.id; if (mounted) setUserId(me.id); }
      }
      if (uid && mounted) {
        await load(uid);
      }
      if (mounted) setLoading(false);
    };
    doLoad();
    return () => { mounted = false; };
  }, [user]);

  const handleMarkRead = async (id: number) => {
    await markNotificationRead(id).catch(() => {});
    setNotes((s) => s.map((n) => (n.id === id ? { ...n, read: true } : n)));
    refreshUnread();
  };

  const handleMarkAll = async () => {
    if (!userId) return;
    await markAllNotificationsRead(userId).catch(() => {});
    setNotes((s) => s.map((n) => ({ ...n, read: true })));
    refreshUnread();
  };

  const handleRefresh = async () => {
    if (!userId) return;
    setLoading(true);
    await load(userId);
    setLoading(false);
    refreshUnread();
  };

  const unread = notes.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold">Notifications</h1>
              {unread > 0 && (
                <span className="h-6 min-w-6 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? "Chargement..." : `${notes.length} notification${notes.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Actualiser
            </Button>
            {unread > 0 && (
              <Button size="sm" variant="outline" onClick={handleMarkAll} className="gap-2">
                <CheckCheck className="h-3.5 w-3.5" />
                Tout marquer lu
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="space-y-2">
        {loading && (
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        )}

        {!loading && notes.length === 0 && (
          <div className="text-center py-16">
            <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune notification pour le moment</p>
          </div>
        )}

        <AnimatePresence>
          {notes.map((n: any, i: number) => {
            const cfg = getTypeConfig(n.type);
            const Icon = cfg.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.03 }}
                layout
              >
                <Card className={`border-border/50 transition-all duration-300 ${!n.read ? "bg-card border-primary/10" : "opacity-60 bg-card/50"}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${!n.read ? "font-medium" : ""}`}>{n.message}</p>
                        {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: cfg.color.includes("blue") ? "#60a5fa" : cfg.color.includes("green") ? "#4ade80" : cfg.color.includes("purple") ? "#c084fc" : cfg.color.includes("red") ? "#f87171" : "hsl(185,75%,48%)" }}>
                          {cfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
                      </div>
                    </div>
                    {!n.read && (
                      <button
                        className="text-xs text-primary hover:text-primary/80 transition-colors shrink-0 underline"
                        onClick={() => handleMarkRead(n.id)}
                      >
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
