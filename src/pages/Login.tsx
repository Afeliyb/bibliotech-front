import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2, Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { seConnecter } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import BiblioLogo from "@/components/BiblioLogo";

export default function Connexion() {
  const { connecter } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !motDePasse) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs.", variant: "destructive" });
      return;
    }
    setChargement(true);
    try {
      const u = await seConnecter(email, motDePasse);
      connecter(u);
    } catch (err: any) {
      toast({ title: "Échec de connexion", description: err.message, variant: "destructive" });
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 30% 30%, hsl(185 75% 50% / 0.08) 0%, transparent 55%), radial-gradient(ellipse at 70% 70%, hsl(265 70% 65% / 0.06) 0%, transparent 55%), hsl(var(--background))" }}>

      {/* Orbes */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(185 75% 50% / 0.4), transparent)", filter: "blur(60px)", animation: "float 6s ease-in-out infinite" }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(265 70% 65% / 0.4), transparent)", filter: "blur(60px)", animation: "float 8s ease-in-out infinite reverse" }} />

      {/* Bouton retour à l'accueil */}
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

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div className="inline-flex items-center justify-center mb-4"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <BiblioLogo size={56} />
          </motion.div>
          <h1 className="font-display text-2xl font-bold">Connexion</h1>
          <p className="text-sm text-muted-foreground mt-1">Accédez à votre espace bibliothèque</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="exemple@domaine.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-card/50 border border-border/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                  autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type={voirMdp ? "text" : "password"} value={motDePasse} onChange={e => setMotDePasse(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-11 rounded-xl bg-card/50 border border-border/70 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                  autoComplete="current-password" />
                <button type="button" onClick={() => setVoirMdp(!voirMdp)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {voirMdp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={chargement}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              whileTap={{ scale: 0.98 }}>
              {chargement ? <><Loader2 className="h-4 w-4 animate-spin" /> Connexion...</> : "Se connecter"}
            </motion.button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/inscription" className="text-primary font-semibold hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground/60">
          <Shield className="h-3 w-3" />
          <span>Connexion sécurisée — BiblioTech v3.0</span>
        </div>
      </motion.div>
    </div>
  );
}
