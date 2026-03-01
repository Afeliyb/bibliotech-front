import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EsgisLogo from "@/components/EsgisLogo";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    user_type: "",
    access_code: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: any) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm_password) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!form.user_type) {
      setError("Veuillez choisir votre statut.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            user_type: form.user_type,
            access_code: form.access_code.toUpperCase(),
          }),
        },
      );
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) setError("Cet email est déjà utilisé.");
        else if (res.status === 403)
          setError("Code d'accès invalide ou déjà utilisé.");
        else setError(data.detail || "Erreur lors de l'inscription.");
        return;
      }
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center gap-3">
          <EsgisLogo size={36} />
<h1 className="text-2xl font-display font-bold">ESGIS Library</h1>
        </div>

        <div className="space-y-1 text-center">
          <h2 className="text-xl font-display font-bold">Créer un compte</h2>
          <p className="text-muted-foreground text-sm">
            Rejoignez la bibliothèque universitaire
          </p>
        </div>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nom complet</label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  className="w-full mt-1 px-3 py-2 bg-card border border-border/50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Adresse email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="vous@exemple.com"
                  className="w-full mt-1 px-3 py-2 bg-card border border-border/50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Statut</label>
                <select
                  name="user_type"
                  value={form.user_type}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 bg-card border border-border/50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                >
                  <option value="">-- Choisissez votre statut --</option>
                  <option value="etudiant">Étudiant</option>
                  <option value="enseignant">Enseignant</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Mot de passe</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full mt-1 px-3 py-2 bg-card border border-border/50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Confirmer le mot de passe
                </label>
                <input
                  name="confirm_password"
                  type="password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full mt-1 px-3 py-2 bg-card border border-border/50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Code d'accès</label>
                <input
                  name="access_code"
                  type="text"
                  value={form.access_code}
                  onChange={handleChange}
                  placeholder="Ex: AB12CD34EF"
                  className="w-full mt-1 px-3 py-2 bg-card border border-border/50 rounded-md text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ce code vous est fourni par l'administration de la
                  bibliothèque.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Inscription en cours..." : "S'inscrire"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link
            to="/login"
            className="text-primary hover:underline font-medium"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
