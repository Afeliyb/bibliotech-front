import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const AdminAccessCodes = () => {
  const [codes, setCodes] = useState<any[]>([]);
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadCodes = async () => {
    try {
      const res = await fetch(`${API}/admin/access-codes`);
      const data = await res.json();
      setCodes(data || []);
    } catch {}
  };

  useEffect(() => { loadCodes(); }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/access-codes/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      toast({ title: `${data.codes.length} codes générés !` });
      loadCodes();
    } catch {
      toast({ title: "Erreur", description: "Impossible de générer les codes." });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const available = codes.filter((c) => !c.used);
  const used = codes.filter((c) => c.used);

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Codes d'accès</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Générez des codes d'inscription à usage unique pour les nouveaux membres.
        </p>
      </motion.div>

      <Card className="border-border/50">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">Nombre de codes :</label>
            <Input
              type="number" min={1} max={50} value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-20 bg-card border-border/50"
            />
          </div>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Génération..." : "Générer"}
          </Button>
          <div className="ml-auto text-sm text-muted-foreground">
            <span className="text-green-500 font-medium">{available.length}</span> disponibles •{" "}
            <span className="text-muted-foreground">{used.length}</span> utilisés
          </div>
        </CardContent>
      </Card>

      {available.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 text-green-500">Codes disponibles</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {available.map((c) => (
              <Card key={c.id} className="border-green-500/20 bg-green-500/5">
                <CardContent className="p-3 flex items-center justify-between">
                  <span className="font-mono text-sm font-bold tracking-wider">{c.code}</span>
                  <button onClick={() => handleCopy(c.code)} className="text-muted-foreground hover:text-primary transition-colors">
                    {copied === c.code ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {used.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Codes utilisés</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {used.map((c) => (
              <Card key={c.id} className="border-border/30 opacity-50">
                <CardContent className="p-3 flex items-center justify-between">
                  <span className="font-mono text-sm line-through">{c.code}</span>
                  <Badge variant="secondary" className="text-[10px]">Utilisé</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {codes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Aucun code généré pour l'instant.</p>
        </div>
      )}
    </div>
  );
};

export default AdminAccessCodes;