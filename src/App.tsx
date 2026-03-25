import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

// Pages
import Accueil from "./pages/Landing";
import Connexion from "./pages/Login";
import Inscription from "./pages/Register";
import TableauDeBord from "./pages/Index";
import Livres from "./pages/Books";
import Emprunts from "./pages/Borrowings";
import Reservations from "./pages/Reservations";
import Penalites from "./pages/Penalties";
import Notifications from "./pages/Notifications";
import Parametres from "./pages/Settings";
import InfoBibliotheque from "./pages/InfoBibliotheque";
import AdminUtilisateurs from "./pages/AdminUsers";
import AdminParametres from "./pages/AdminSettings";
import AdminCodesAcces from "./pages/AdminAccessCodes";
import PageIntrouvable from "./pages/NotFound";

const queryClient = new QueryClient();

const RequiertAuth = ({ children }: { children: React.ReactNode }) => {
  const { utilisateur, chargement } = useAuth();
  if (chargement) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Chargement...</p>
      </div>
    </div>
  );
  return utilisateur ? <>{children}</> : <Navigate to="/connexion" replace />;
};

const AdminSeulement = ({ children }: { children: React.ReactNode }) => {
  const { utilisateur } = useAuth();
  return utilisateur?.role === "admin" ? <>{children}</> : <Navigate to="/livres" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Accueil />} />
              <Route path="/connexion" element={<Connexion />} />
              <Route path="/inscription" element={<Inscription />} />
              {/* Anciens chemins redirigés */}
              <Route path="/login" element={<Navigate to="/connexion" replace />} />
              <Route path="/register" element={<Navigate to="/inscription" replace />} />

              <Route path="/*" element={
                <RequiertAuth>
                  <Layout>
                    <Routes>
                      <Route path="/tableau-de-bord" element={<TableauDeBord />} />
                      <Route path="/livres" element={<Livres />} />
                      <Route path="/emprunts" element={<Emprunts />} />
                      <Route path="/reservations" element={<Reservations />} />
                      <Route path="/penalites" element={<Penalites />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/parametres" element={<Parametres />} />
                      <Route path="/bibliotheque" element={<InfoBibliotheque />} />
                      <Route path="/admin/utilisateurs" element={<AdminSeulement><AdminUtilisateurs /></AdminSeulement>} />
                      <Route path="/admin/parametres" element={<AdminSeulement><AdminParametres /></AdminSeulement>} />
                      <Route path="/admin/codes-acces" element={<AdminSeulement><AdminCodesAcces /></AdminSeulement>} />
                      {/* Anciens chemins */}
                      <Route path="/dashboard" element={<Navigate to="/tableau-de-bord" replace />} />
                      <Route path="/borrowings" element={<Navigate to="/emprunts" replace />} />
                      <Route path="/penalties" element={<Navigate to="/penalites" replace />} />
                      <Route path="/settings" element={<Navigate to="/parametres" replace />} />
                      <Route path="*" element={<PageIntrouvable />} />
                    </Routes>
                  </Layout>
                </RequiertAuth>
              } />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
