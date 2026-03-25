import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { obtenirPenalites, payerPenalite } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function Penalites() {
  const { utilisateur } = useAuth();
  const [penalites, setPenalites] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);

  const charger = async () => {
    setChargement(true);
    try {
      const uid = utilisateur?.role === "admin" ? undefined : utilisateur?.id ?? undefined;
      const data = await obtenirPenalites(uid);
      setPenalites(data || []);
    } finally { setChargement(false); }
  };

  useEffect(() => { charger(); }, [utilisateur]);

  const handlePayer = async (id: number) => {
    try {
      await payerPenalite(id);
      toast({ title: "✅ Pénalité marquée comme payée" });
      charger();
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const estAdmin = utilisateur?.role === "admin";
  const total = penalites.filter(p => !p.payee).reduce((s, p) => s + p.montant, 0);

  return (
    <div className="space-y-5 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">{estAdmin ? "Pénalités" : "Mes pénalités"}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {penalites.filter(p => !p.payee).length} impayée(s) — Total : {total.toLocaleString("fr-FR")} FCFA
        </p>
      </motion.div>

      <div className="space-y-2">
        {chargement && [...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl animate-shimmer" />)}
        {!chargement && penalites.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucune pénalité</p>
          </div>
        )}
        {penalites.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className={`border-border/50 ${!p.payee ? "border-red-500/20" : "opacity-60"}`}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${p.payee ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                    {p.payee ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-red-400" />}
                  </div>
                  <div className="min-w-0">
                    {estAdmin && <p className="text-xs text-primary font-medium"> {p.nom_utilisateur}</p>}
                    {p.titre_livre && <p className="font-semibold text-sm truncate"> {p.titre_livre}</p>}
                    <p className="text-xs text-muted-foreground">{p.motif}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className={`font-bold text-sm ${p.payee ? "text-emerald-400" : "text-red-400"}`}>
                      {p.montant.toLocaleString("fr-FR")} FCFA
                    </p>
                    <p className="text-xs text-muted-foreground">{p.payee ? "Payée" : "Impayée"}</p>
                  </div>
                  {!p.payee && estAdmin && (
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handlePayer(p.id)}>
                      Marquer payée
                    </Button>
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
