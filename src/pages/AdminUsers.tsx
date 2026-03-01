import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";
import { getUsers, getBorrowings, getPenalties } from "@/lib/api";

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [penalties, setPenalties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("tous");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getUsers(), getBorrowings(), getPenalties()])
      .then(([us, bs, ps]) => {
        if (!mounted) return;
        setUsers(us || []);
        setBorrowings(bs || []);
        setPenalties(ps || []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const activeBorrowingsCount = (userId: number) =>
    borrowings.filter((b) => b.user_id === userId && !b.returned).length;
  const unpaidPenaltiesCount = (userId: number) =>
    penalties.filter((p) => p.user_id === userId && !p.paid).length;

  const members = users.filter((u) => u.role === "member");
  const etudiants = members.filter((u) => u.user_type === "etudiant");
  const enseignants = members.filter((u) => u.user_type === "enseignant");
  const admins = users.filter((u) => u.role === "admin");

  const filtered = users
    .filter((u) => {
      if (filter === "etudiant") return u.user_type === "etudiant";
      if (filter === "enseignant") return u.user_type === "enseignant";
      if (filter === "admin") return u.role === "admin";
      return true;
    })
    .filter((u) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        (u.name || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s)
      );
    });

  const getUserTypeLabel = (u: any) => {
    if (u.role === "admin") return { label: "Admin", color: "bg-primary/10 text-primary border-primary/20" };
    if (u.user_type === "etudiant") return { label: "Étudiant", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
    if (u.user_type === "enseignant") return { label: "Enseignant", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" };
    return { label: "Membre", color: "bg-secondary text-secondary-foreground" };
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestion des membres de la bibliothèque
        </p>
      </motion.div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total membres", value: users.length, color: "text-primary" },
          { label: "Étudiants", value: etudiants.length, color: "text-blue-500" },
          { label: "Enseignants", value: enseignants.length, color: "text-purple-500" },
          { label: "Admins", value: admins.length, color: "text-orange-500" },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "tous", label: "Tous" },
          { key: "etudiant", label: "Étudiants" },
          { key: "enseignant", label: "Enseignants" },
          { key: "admin", label: "Admins" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              filter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border/50 text-muted-foreground hover:border-primary/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Recherche */}
      <Input
        placeholder="Rechercher par nom ou email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-card border-border/50"
      />

      {/* Liste */}
      <div className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Chargement...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun utilisateur trouvé</p>
        )}
        {filtered.map((u) => {
          const typeInfo = getUserTypeLabel(u);
          return (
            <Card key={u.id} className="border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {(u.name || u.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{u.name || u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap justify-end">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    📚 {activeBorrowingsCount(u.id)} emprunt(s)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ⚠️ {unpaidPenaltiesCount(u.id)} pénalité(s)
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminUsers;