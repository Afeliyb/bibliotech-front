import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Building, Clock, BookOpen, AlertTriangle, Send, Moon, Sun, Image, CheckCircle2, Bell } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { obtenirParametres, sauvegarderParametres, diffuserNotification, declencherVerification } from "@/lib/api";

const DEFAUTS = {
  nom_bibliotheque: "BiblioTech", adresse: "", telephone: "", horaires: "",
  email_contact: "", site_web: "", logo: "",
  duree_emprunt_jours: "14", max_emprunts_par_membre: "3", max_reservations_par_membre: "3",
  penalite_par_jour: "500", penalite_maximum: "10000", delai_retrait_heures: "48", regles: "",
};

export default function AdminParametres() {
  const [settings, setSettings] = useState<any>(DEFAUTS);
  const [chargement, setChargement] = useState(true);
  const [sauvegarde, setSauvegarde] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [notifTitre, setNotifTitre] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    obtenirParametres()
      .then(d => setSettings({ ...DEFAUTS, ...d }))
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  const champ = (cle: string, valeur: string) => setSettings((p: any) => ({ ...p, [cle]: valeur }));

  const handleSauvegarder = async () => {
    setSauvegarde(true);
    try {
      await sauvegarderParametres(settings);
      toast({ title: "✅ Paramètres sauvegardés" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder.", variant: "destructive" });
    } finally { setSauvegarde(false); }
  };

  const handleDiffuser = async () => {
    if (!notifTitre || !notifMsg) {
      toast({ title: "Titre et message requis", variant: "destructive" }); return;
    }
    setEnvoi(true);
    try {
      const r = await diffuserNotification(notifTitre, notifMsg);
      toast({ title: `✅ Notification envoyée à ${r?.message?.match(/\d+/)?.[0] ?? ""} membre(s)` });
      setNotifTitre(""); setNotifMsg("");
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setEnvoi(false); }
  };

  const handleVerif = async () => {
    try {
      await declencherVerification();
      toast({ title: "✅ Vérification effectuée — notifications envoyées si nécessaire" });
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => champ("logo", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  if (chargement) return <div className="text-sm text-muted-foreground">Chargement...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">Configuration générale de la bibliothèque</p>
      </motion.div>

      {/* Apparence */}
      <Card className="border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">
          {theme === "dark" ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-amber-400" />} Apparence
        </CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Thème de l'interface</p>
              <p className="text-xs text-muted-foreground">{theme === "dark" ? "Mode sombre" : "Mode clair"}</p>
            </div>
            <button onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 hover:border-primary/40 transition-all text-sm">
              {theme === "dark" ? <><Sun className="h-4 w-4 text-amber-400" /> Mode clair</> : <><Moon className="h-4 w-4 text-primary" /> Mode sombre</>}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Identité bibliothèque */}
      <Card className="border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">
          <Building className="h-4 w-4 text-primary" /> Identité de la bibliothèque
        </CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {/* Logo */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Logo / Photo de l'établissement</label>
            <div className="flex items-center gap-3">
              {settings.logo ? (
                <img src={settings.logo} alt="logo" className="h-14 w-14 rounded-xl object-cover border border-border/50" />
              ) : (
                <div className="h-14 w-14 rounded-xl border-2 border-dashed border-border/50 flex items-center justify-center">
                  <Image className="h-5 w-5 text-muted-foreground/40" />
                </div>
              )}
              <div>
                <input type="file" id="logo-upload" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <label htmlFor="logo-upload" className="cursor-pointer text-xs px-3 py-2 rounded-lg border border-border/60 hover:border-primary/40 transition-colors block">
                  Changer le logo
                </label>
                {settings.logo && (
                  <button onClick={() => champ("logo", "")} className="text-xs text-muted-foreground hover:text-destructive mt-1 block">Supprimer</button>
                )}
              </div>
            </div>
          </div>
          {[
            { cle: "nom_bibliotheque", label: "Nom de l'établissement" },
            { cle: "adresse", label: "Adresse" },
            { cle: "telephone", label: "Téléphone" },
            { cle: "email_contact", label: "Email de contact" },
            { cle: "site_web", label: "Site web" },
          ].map(({ cle, label }) => (
            <div key={cle}>
              <label className="text-xs text-muted-foreground">{label}</label>
              <Input value={settings[cle] ?? ""} onChange={e => champ(cle, e.target.value)}
                className="mt-1 bg-card border-border/50" placeholder={label} />
            </div>
          ))}
          <div>
            <label className="text-xs text-muted-foreground">Horaires d'ouverture</label>
            <Input value={settings.horaires ?? ""} onChange={e => champ("horaires", e.target.value)}
              placeholder="Ex: Lun-Ven 8h-18h | Sam 9h-13h" className="mt-1 bg-card border-border/50" />
          </div>
        </CardContent>
      </Card>

      {/* Règlement */}
      <Card className="border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Règlement intérieur
        </CardTitle></CardHeader>
        <CardContent>
          <label className="text-xs text-muted-foreground mb-1.5 block">Règles affichées aux membres</label>
          <textarea value={settings.regles ?? ""} onChange={e => champ("regles", e.target.value)} rows={6}
            className="w-full px-3 py-2 rounded-xl bg-card border border-border/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Saisissez les règles de la bibliothèque..." />
        </CardContent>
      </Card>

      {/* Emprunts */}
      <Card className="border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" /> Durée et limites d'emprunt
        </CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {[
            { cle: "duree_emprunt_jours", label: "Durée max (jours)", max: 90 },
            { cle: "max_emprunts_par_membre", label: "Max emprunts simultanés", max: 20 },
            { cle: "max_reservations_par_membre", label: "Max réservations actives", max: 20 },
            { cle: "delai_retrait_heures", label: "Délai retrait réservation (h)", max: 168 },
          ].map(({ cle, label, max }) => (
            <div key={cle}>
              <label className="text-xs text-muted-foreground">{label}</label>
              <Input type="number" min={1} max={max} value={settings[cle] ?? ""} onChange={e => champ(cle, e.target.value)}
                className="mt-1 bg-card border-border/50 w-28" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pénalités */}
      <Card className="border-border/50">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400" /> Pénalités de retard
        </CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {[
            { cle: "penalite_par_jour", label: "Montant/jour (FCFA)" },
            { cle: "penalite_maximum", label: "Pénalité maximum (FCFA)" },
          ].map(({ cle, label }) => (
            <div key={cle}>
              <label className="text-xs text-muted-foreground">{label}</label>
              <Input type="number" min={0} value={settings[cle] ?? ""} onChange={e => champ(cle, e.target.value)}
                className="mt-1 bg-card border-border/50 w-36" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSauvegarder} disabled={sauvegarde} className="w-full h-11 font-semibold">
        {sauvegarde ? "Sauvegarde en cours..." : " Sauvegarder les paramètres"}
      </Button>

      {/* Notifications de masse */}
      <Card className="border-border/50 border-primary/20">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" /> Diffuser une notification à tous les membres
        </CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Titre</label>
            <Input value={notifTitre} onChange={e => setNotifTitre(e.target.value)} placeholder="Titre de la notification" className="bg-card border-border/50" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Message</label>
            <textarea value={notifMsg} onChange={e => setNotifMsg(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-xl bg-card border border-border/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Message à envoyer à tous les membres..." />
          </div>
          <Button onClick={handleDiffuser} disabled={envoi} className="w-full gap-2">
            <Send className="h-4 w-4" /> {envoi ? "Envoi..." : "Envoyer à tous les membres"}
          </Button>
        </CardContent>
      </Card>

      {/* Vérification retards */}
      <Card className="border-border/50 border-amber-500/20">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" /> Tâches automatiques
        </CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Déclencher manuellement la vérification des retards, rappels d'échéance et annulation de réservations expirées.
          </p>
          <Button variant="outline" onClick={handleVerif} className="gap-2 w-full">
            <AlertTriangle className="h-4 w-4 text-amber-400" /> Lancer la vérification maintenant
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Ajout Clock dans les imports
