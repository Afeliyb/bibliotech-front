import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { obtenirUtilisateurs, supprimerUtilisateur } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Users, Search, Trash2, GraduationCap, BookOpen, ShieldCheck } from "lucide-react";

export default function AdminUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [confirmSuppr, setConfirmSuppr] = useState<number | null>(null);

  const charger = async () => {
    setChargement(true);
    try { setUtilisateurs(await obtenirUtilisateurs()); }
    finally { setChargement(false); }
  };

  useEffect(() => { charger(); }, []);

  const handleSupprimer = async (id: number) => {
    try {
      await supprimerUtilisateur(id);
      toast({ title: "✅ Utilisateur supprimé" });
      setConfirmSuppr(null);
      charger();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const filtres = utilisateurs.filter(u =>
    u.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
    u.email?.toLowerCase().includes(recherche.toLowerCase())
  );

  const membres = filtres.filter(u => u.role === "membre");
  const admins = filtres.filter(u => u.role === "admin");

  const iconeProfil = (u: any) => {
    if (u.role === "admin") return <ShieldCheck className="h-4 w-4 text-amber-400" />;
    if (u.type_utilisateur === "enseignant") return <BookOpen className="h-4 w-4 text-purple-400" />;
    return <GraduationCap className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">{membres.length} membre(s) · {admins.length} admin(s)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={recherche} onChange={e => setRecherche(e.target.value)} className="pl-9 h-9 w-56" />
        </div>
      </motion.div>

      {chargement && [...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl animate-shimmer" />)}

      {!chargement && filtres.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucun utilisateur trouvé</p>
        </div>
      )}

      <div className="space-y-2">
        {filtres.map((u, i) => (
          <motion.div key={u.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="border-border/50 hover:border-primary/20 transition-all">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${u.role === "admin" ? "bg-amber-500/15" : u.type_utilisateur === "enseignant" ? "bg-purple-500/15" : "bg-primary/15"}`}>
                    {iconeProfil(u)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{u.nom}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold capitalize ${u.role === "admin" ? "bg-amber-500/15 text-amber-400" : "bg-primary/15 text-primary"}`}>
                    {u.role === "admin" ? "Administrateur" : u.type_utilisateur === "enseignant" ? "Enseignant" : "Étudiant"}
                  </span>
                  {u.role !== "admin" && (
                    confirmSuppr === u.id ? (
                      <div className="flex gap-1">
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleSupprimer(u.id)}>Confirmer</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setConfirmSuppr(null)}>Annuler</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setConfirmSuppr(u.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
