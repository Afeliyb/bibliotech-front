import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import EsgisLogo from "@/components/EsgisLogo";
import { Link } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      if (!res.ok) {
        if (res.status === 401) setError("Email ou mot de passe incorrect");
        else setError("Erreur lors de la connexion");
        return;
      }
      const data = await res.json();
      login({
        id: data.id,
        role: data.role,
        name: data.name,
        email: data.email,
        profile_picture: data.profile_picture,
      });
    } catch (err) {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche - Présentation */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 border-r border-border/50 flex-col items-center justify-center p-12 space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <EsgisLogo size={32} />
        </div>
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-display font-bold tracking-tight">
            ESGIS Library
          </h1>
          <p className="text-muted-foreground text-lg">
            Système de gestion de bibliothèque universitaire
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 mt-8 w-full max-w-sm">
          {[
            { icon: BookOpen, text: "Gérez vos emprunts en ligne" },
            { icon: BookOpen, text: "Réservez vos livres facilement" },
            { icon: BookOpen, text: "Suivez vos pénalités et notifications" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panneau droit - Formulaire */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Logo mobile */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <EsgisLogo size={36} />
<h1 className="text-2xl font-display font-bold">ESGIS Library</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold">Bienvenue !</h2>
            <p className="text-muted-foreground text-sm">
              Connectez-vous à votre espace bibliothèque
            </p>
          </div>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Adresse email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full mt-1 px-3 py-2 bg-card border border-border/50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Mot de passe</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full mt-1 px-3 py-2 bg-card border border-border/50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              to="/"
              className="text-xs hover:text-primary text-muted-foreground transition-colors"
            >
              ← Retour à l'accueil
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link
              to="/register"
              className="text-primary hover:underline font-medium"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
