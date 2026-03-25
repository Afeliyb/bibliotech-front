import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { obtenirCodesAcces, genererCodesAcces } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { KeyRound, Plus, Copy, CheckCircle2, XCircle } from "lucide-react";

export default function AdminCodesAcces() {
  const [codes, setCodes] = useState<any[]>([]);
  const [chargement, setChargement] = useState(true);
  const [nombre, setNombre] = useState(5);
  const [generation, setGeneration] = useState(false);
  const [copie, setCopie] = useState<string | null>(null);

  const charger = async () => {
    setChargement(true);
    try { setCodes(await obtenirCodesAcces()); }
    finally { setChargement(false); }
  };

  useEffect(() => { charger(); }, []);

  const handleGenerer = async () => {
    if (nombre < 1 || nombre > 50) { toast({ title: "Entre 1 et 50 codes", variant: "destructive" }); return; }
    setGeneration(true);
    try {
      const r = await genererCodesAcces(nombre);
      toast({ title: `✅ ${r.total} code(s) généré(s)` });
      charger();
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
    finally { setGeneration(false); }
  };

  const copier = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopie(code);
    toast({ title: "Code copié !" });
    setTimeout(() => setCopie(null), 2000);
  };

  const disponibles = codes.filter(c => !c.utilise);
  const utilises = codes.filter(c => c.utilise);

  return (
    <div className="space-y-5 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Codes d'accès</h1>
        <p className="text-sm text-muted-foreground">{disponibles.length} disponible(s) · {utilises.length} utilisé(s)</p>
      </motion.div>

      <Card className="border-border/50 border-primary/20">
        <CardContent className="p-4 flex items-center gap-3">
          <KeyRound className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Générer des codes d'inscription</p>
            <p className="text-xs text-muted-foreground">Chaque code est à usage unique</p>
          </div>
          <div className="flex items-center gap-2">
            <Input type="number" min={1} max={50} value={nombre} onChange={e => setNombre(Number(e.target.value))} className="w-20 h-9" />
            <Button size="sm" onClick={handleGenerer} disabled={generation} className="gap-2">
              <Plus className="h-4 w-4" /> {generation ? "..." : "Générer"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Codes disponibles ({disponibles.length})</p>
        {chargement && <div className="h-16 rounded-xl animate-shimmer" />}
        {disponibles.length === 0 && !chargement && (
          <p className="text-sm text-muted-foreground text-center py-4">Aucun code disponible</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {disponibles.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="border-border/50 hover:border-primary/20 transition-all">
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="font-mono text-sm font-semibold">{c.code}</span>
                  </div>
                  <button onClick={() => copier(c.code)} className="text-muted-foreground hover:text-primary transition-colors">
                    {copie === c.code ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {utilises.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Codes utilisés ({utilises.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {utilises.map((c, i) => (
              <Card key={c.id} className="border-border/30 opacity-50">
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-mono text-sm line-through text-muted-foreground">{c.code}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate max-w-24">{c.utilise_par}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
