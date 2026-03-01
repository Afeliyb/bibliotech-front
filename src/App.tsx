import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Books from "./pages/Books";
import Borrowings from "./pages/Borrowings";
import Reservations from "./pages/Reservations";
import Penalties from "./pages/Penalties";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminUsers from "./pages/AdminUsers";
import AdminSettings from "./pages/AdminSettings";
import AdminAccessCodes from "./pages/AdminAccessCodes";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const queryClient = new QueryClient();

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,25%,6%)]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Chargement...</p>
      </div>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminOnly = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user?.role === "admin" ? <>{children}</> : <Navigate to="/books" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Index />} />
                      <Route path="/books" element={<Books />} />
                      <Route path="/borrowings" element={<Borrowings />} />
                      <Route path="/reservations" element={<Reservations />} />
                      <Route path="/penalties" element={<Penalties />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/admin/users" element={<AdminOnly><AdminUsers /></AdminOnly>} />
                      <Route path="/admin/settings" element={<AdminOnly><AdminSettings /></AdminOnly>} />
                      <Route path="/admin/access-codes" element={<AdminOnly><AdminAccessCodes /></AdminOnly>} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </RequireAuth>
              }
            />
          </Routes>
        </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
