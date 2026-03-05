import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { updateUser, getUsers } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Camera, User, Mail, Lock, Save } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [preview, setPreview] = useState<string | null>(user?.profile_picture || null);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(user?.id ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // refresh user id if not set
    if (!userId && user?.email) {
      getUsers().then((users) => {
        const me = users.find((u: any) => u.email === user.email);
        if (me) setUserId(me.id);
      }).catch(() => {});
    }
  }, [user]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // resize & compress
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 200;
        const ratio = Math.min(max / img.width, max / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const b64 = canvas.toDataURL("image/jpeg", 0.85);
        setPreview(b64);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (password && password !== confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    if (!userId) {
      toast({ title: "Erreur", description: "Impossible de retrouver votre profil.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload: any = { name, email };
      if (preview !== user?.profile_picture) payload.profile_picture = preview;
      if (password) payload.password = password;

      const updated = await updateUser(userId, payload);
updateProfile({
  name: updated.name,
  email: updated.email,
  profile_picture: preview,  // 👈 on utilise preview directement, pas updated.profile_picture
});
      setPassword("");
      setConfirmPassword("");
      toast({ title: "Profil mis à jour ✓", description: "Vos informations ont été enregistrées." });
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const initials = name
    ? name.charAt(0).toUpperCase()
    : email
    ? email.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="space-y-6 max-w-xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Paramètres</h1>
        <Card className="border-border/50">
  <CardContent className="p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">Apparence</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          {theme === "dark" ? "Mode sombre activé" : "Mode clair activé"}
        </p>
      </div>
      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 hover:border-primary/50 transition-all"
      >
        {theme === "dark" ? (
          <><Sun className="h-4 w-4 text-amber-400" /> Passer au clair</>
        ) : (
          <><Moon className="h-4 w-4 text-primary" /> Passer au sombre</>
        )}
      </button>
    </div>
  </CardContent>
</Card>
        <p className="text-sm text-muted-foreground mt-1">Gérez vos informations personnelles</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/50">
          <CardContent className="p-6 space-y-6">

            {/* Photo de profil */}
            <div>
              <h3 className="font-semibold text-sm mb-4">Photo de profil</h3>
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div
                    className="h-20 w-20 rounded-full border-2 border-border overflow-hidden bg-primary/10 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    {preview ? (
                      <img src={preview} alt="profil" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-primary">{initials}</span>
                    )}
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center border-2 border-card hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-3.5 w-3.5 text-primary-foreground" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium">Changer la photo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG. Max 5MB. Sera redimensionnée à 200×200px.</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                      <Camera className="h-3.5 w-3.5 mr-2" />
                      Choisir
                    </Button>
                    {preview && (
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setPreview(null)}>
                        Supprimer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handlePhoto} />
            </div>

            <div className="border-t border-border/50" />

            {/* Informations */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Informations personnelles</h3>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1.5">
                  <User className="h-3.5 w-3.5" /> Nom complet
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1.5">
                  <Mail className="h-3.5 w-3.5" /> Adresse e-mail
                </label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" />
              </div>
            </div>

            <div className="border-t border-border/50" />

            {/* Mot de passe */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Changer le mot de passe</h3>
              <p className="text-xs text-muted-foreground">Laissez vide pour ne pas modifier.</p>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1.5">
                  <Lock className="h-3.5 w-3.5" /> Nouveau mot de passe
                </label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2 mb-1.5">
                  <Lock className="h-3.5 w-3.5" /> Confirmer le mot de passe
                </label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
