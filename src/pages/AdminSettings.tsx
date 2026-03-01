import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Building, Clock, BookOpen, AlertTriangle, Users, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const defaultSettings = {
  library_name: "ESGIS Library",
  library_address: "",
  library_phone: "",
  library_hours: "",
  loan_duration_days: "14",
  max_loans_per_member: "3",
  max_reservations_per_member: "3",
  penalty_per_day: "500",
  max_penalty: "10000",
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<any>(defaultSettings);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    Promise.all([
      fetch(`${API}/admin/settings`).then((r) => r.json()),
      fetch(`${API}/users`).then((r) => r.json()),
    ])
      .then(([s, users]) => {
        setSettings(s);
        const etudiants = (users || []).filter(
          (u: any) => u.user_type === "etudiant",
        ).length;
        const enseignants = (users || []).filter(
          (u: any) => u.user_type === "enseignant",
        ).length;
        const admins = (users || []).filter(
          (u: any) => u.role === "admin",
        ).length;
        setStats({ etudiants, enseignants, admins, total: users.length });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((s: any) => ({ ...s, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Paramètres sauvegardés ✓" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder." });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <p className="text-sm text-muted-foreground">Chargement...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-bold">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configuration générale de la bibliothèque
        </p>
      </motion.div>
      {/* Apparence */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {theme === "dark"
              ? <Moon className="h-4 w-4 text-primary" />
              : <Sun className="h-4 w-4 text-amber-400" />}
            Apparence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Thème de l'interface</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {theme === "dark" ? "Mode sombre activé" : "Mode clair activé"}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 hover:border-primary/50 transition-all text-sm"
            >
              {theme === "dark"
                ? <><Sun className="h-4 w-4 text-amber-400" /> Mode clair</>
                : <><Moon className="h-4 w-4 text-primary" /> Mode sombre</>}
            </button>
          </div>
        </CardContent>
      </Card>


      {/* Informations de la bibliothèque */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" /> Informations de la
            bibliothèque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Nom</label>
            <Input
              value={settings.library_name}
              onChange={(e) => handleChange("library_name", e.target.value)}
              className="mt-1 bg-card border-border/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Adresse</label>
            <Input
              value={settings.library_address}
              onChange={(e) => handleChange("library_address", e.target.value)}
              placeholder="Ex: Université de Lomé, Bâtiment A"
              className="mt-1 bg-card border-border/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Téléphone</label>
            <Input
              value={settings.library_phone}
              onChange={(e) => handleChange("library_phone", e.target.value)}
              placeholder="Ex: +228 XX XX XX XX"
              className="mt-1 bg-card border-border/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Horaires d'ouverture
            </label>
            <Input
              value={settings.library_hours}
              onChange={(e) => handleChange("library_hours", e.target.value)}
              placeholder="Ex: Lun-Ven 8h-18h, Sam 9h-13h"
              className="mt-1 bg-card border-border/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Durée et limites d'emprunt */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> Durée et limites
            d'emprunt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">
              Durée maximale d'emprunt (jours)
            </label>
            <Input
              type="number"
              min={1}
              max={90}
              value={settings.loan_duration_days}
              onChange={(e) =>
                handleChange("loan_duration_days", e.target.value)
              }
              className="mt-1 bg-card border-border/50 w-32"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Nombre max de livres empruntés simultanément
            </label>
            <Input
              type="number"
              min={1}
              max={20}
              value={settings.max_loans_per_member}
              onChange={(e) =>
                handleChange("max_loans_per_member", e.target.value)
              }
              className="mt-1 bg-card border-border/50 w-32"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Nombre max de réservations actives
            </label>
            <Input
              type="number"
              min={1}
              max={20}
              value={settings.max_reservations_per_member}
              onChange={(e) =>
                handleChange("max_reservations_per_member", e.target.value)
              }
              className="mt-1 bg-card border-border/50 w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pénalités */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" /> Pénalités de
            retard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">
              Montant par jour de retard (FCFA)
            </label>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={settings.penalty_per_day}
              onChange={(e) => handleChange("penalty_per_day", e.target.value)}
              className="mt-1 bg-card border-border/50 w-32"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">
              Pénalité maximum (FCFA)
            </label>
            <Input
              type="number"
              min={0}
              step={0.5}
              value={settings.max_penalty}
              onChange={(e) => handleChange("max_penalty", e.target.value)}
              className="mt-1 bg-card border-border/50 w-32"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Sauvegarde en cours..." : "Sauvegarder les paramètres"}
      </Button>
    </div>
  );
};

export default AdminSettings;
