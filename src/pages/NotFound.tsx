import { Link } from "react-router-dom";
import { BookX } from "lucide-react";
export default function PageIntrouvable() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-6">
      <BookX className="h-12 w-12 text-muted-foreground/40" />
      <h1 className="font-display text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page introuvable</p>
      <Link to="/" className="text-primary hover:underline text-sm">Retour à l'accueil</Link>
    </div>
  );
}
