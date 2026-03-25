import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, KeyRound, Loader2, GraduationCap, BookMarked, Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { sInscrire } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import BiblioLogo from "@/components/BiblioLogo";

export default function Inscription() {
  const { connecter } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ nom: "", email: "", mot_de_passe: "", type_utilisateur: "etudiant", code_acces: "" });
  const [voirMdp, setVoirMdp] = useState(false);
  const [chargement, setChargement] = useState(false);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.mot_de_passe || !form.code_acces) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs.", variant: "destructive" });
      return;
    }
    setChargement(true);
    try {
      const u = await sInscrire(form);
      connecter(u);
      toast({ title: "Compte créé ✓", description: `Bienvenue ${u.nom} !` });
    } catch (err: any) {
      toast({ title: "Erreur d'inscription", description: err.message, variant: "destructive" });
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 70% 20%, hsl(265 70% 65% / 0.08) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, hsl(185 75% 50% / 0.07) 0%, transparent 55%), hsl(var(--background))" }}>

      <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(265 70% 65% / 0.5), transparent)", filter: "blur(60px)" }} />

      {/* Bouton retour */}
      <Link to="/"
        className="absolute top-5 left-5 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group z-10">
        <span className="h-8 w-8 rounded-xl border border-border/50 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/10 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </span>
        <span className="hidden sm:block">Retour à l'accueil</span>
      </Link>

      <motion.div className="w-full max-w-sm relative z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}>

        <div className="text-center mb-7">
          <motion.div className="inline-flex items-center justify-center mb-4" whileHover={{ scale: 1.05 }}>
            <BiblioLogo size={56} />
          </motion.div>
          <h1 className="font-display text-2xl font-bold">Créer un compte</h1>
          <p className="text-sm text-muted-foreground mt-1">Rejoindre la bibliothèque</p>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" value={form.nom} onChange={e => set("nom", e.target.value)} placeholder="Jean Dupont"
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-card/50 border border-border/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="jean@domaine.com"
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-card/50 border border-border/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Je suis</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: "etudiant",   label: "Étudiant(e)",   icon: GraduationCap },
                  { val: "enseignant", label: "Enseignant(e)", icon: BookMarked },
                ].map(({ val, label, icon: Icon }) => (
                  <button key={val} type="button" onClick={() => set("type_utilisateur", val)}
                    className={`h-10 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${form.type_utilisateur === val ? "bg-primary/15 border-primary/40 text-primary" : "border-border/60 text-muted-foreground hover:bg-card/70"}`}>
                    <Icon className="h-3.5 w-3.5" />{label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type={voirMdp ? "text" : "password"} value={form.mot_de_passe} onChange={e => set("mot_de_passe", e.target.value)} placeholder="••••••••"
                  className="w-full h-10 pl-10 pr-11 rounded-xl bg-card/50 border border-border/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all" />
                <button type="button" onClick={() => setVoirMdp(!voirMdp)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {voirMdp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Code d'accès</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" value={form.code_acces} onChange={e => set("code_acces", e.target.value.toUpperCase())} placeholder="CODE12345"
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-card/50 border border-border/70 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all" />
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Fourni par l'administration de la bibliothèque</p>
            </div>

            <motion.button type="submit" disabled={chargement}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-1"
              whileTap={{ scale: 0.98 }}>
              {chargement ? <><Loader2 className="h-4 w-4 animate-spin" /> Création...</> : "Créer mon compte"}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/connexion" className="text-primary font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground/60">
          <Shield className="h-3 w-3" />
          <span>Inscription sécurisée — BiblioTech v3.0</span>
        </div>
      </motion.div>
    </div>
  );
}
