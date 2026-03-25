import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { User, Mail, Lock, Eye, EyeOff, Camera, Moon, Sun, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { modifierUtilisateur } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";

export default function ParametresMembre() {
  const { utilisateur, mettreAJourProfil } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [nom, setNom] = useState(utilisateur?.nom ?? "");
  const [email, setEmail] = useState(utilisateur?.email ?? "");
  const [mdp, setMdp] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);
  const [photo, setPhoto] = useState(utilisateur?.photo_profil ?? "");
  const [sauvegarde, setSauvegarde] = useState(false);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSauvegarder = async () => {
    if (!utilisateur?.id) return;
    setSauvegarde(true);
    try {
      const payload: any = { nom, email, photo_profil: photo || null };
      if (mdp) payload.mot_de_passe = mdp;
      const u = await modifierUtilisateur(utilisateur.id, payload);
      mettreAJourProfil({ nom: u.nom, email: u.email, photo_profil: u.photo_profil });
      toast({ title: "✅ Profil mis à jour" });
      setMdp("");
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setSauvegarde(false); }
  };

  const initiales = utilisateur?.nom?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="space-y-5 max-w-xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérez votre profil et vos préférences</p>
      </motion.div>

      {/* Photo */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              {photo ? (
                <img src={photo} alt="profil" className="h-20 w-20 rounded-2xl object-cover border-2 border-primary/30" />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary">
                  {initiales}
                </div>
              )}
              <input type="file" id="photo-profil" accept="image/*" className="hidden" onChange={handlePhoto} />
              <label htmlFor="photo-profil"
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                <Camera className="h-3.5 w-3.5 text-primary-foreground" />
              </label>
            </div>
            <div>
              <p className="font-semibold">{utilisateur?.nom}</p>
              <p className="text-sm text-muted-foreground">{utilisateur?.email}</p>
              <p className="text-xs text-primary capitalize mt-1">{utilisateur?.type_utilisateur ?? utilisateur?.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Infos */}
      <Card className="border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Informations personnelles</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Nom complet</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={nom} onChange={e => setNom(e.target.value)} className="pl-9 bg-card border-border/50" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-9 bg-card border-border/50" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Nouveau mot de passe <span className="opacity-50">(laisser vide pour garder l'actuel)</span></label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type={voirMdp ? "text" : "password"} value={mdp} onChange={e => setMdp(e.target.value)}
                placeholder="••••••••" className="pl-9 pr-10 bg-card border-border/50" />
              <button type="button" onClick={() => setVoirMdp(!voirMdp)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {voirMdp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thème */}
      <Card className="border-border/50">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Thème</p>
            <p className="text-xs text-muted-foreground">{theme === "dark" ? "Mode sombre" : "Mode clair"}</p>
          </div>
          <button onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 hover:border-primary/40 transition-all text-sm">
            {theme === "dark" ? <><Sun className="h-4 w-4 text-amber-400" /> Mode clair</> : <><Moon className="h-4 w-4 text-primary" /> Mode sombre</>}
          </button>
        </CardContent>
      </Card>

      <Button onClick={handleSauvegarder} disabled={sauvegarde} className="w-full h-11 gap-2 font-semibold">
        <Save className="h-4 w-4" /> {sauvegarde ? "Sauvegarde..." : "Enregistrer les modifications"}
      </Button>
    </div>
  );
}
