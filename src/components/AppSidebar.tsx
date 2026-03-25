import {
  BookOpen, ArrowLeftRight, CalendarClock, AlertTriangle,
  Bell, Settings, Users, LayoutDashboard, KeyRound, LogOut,
  Info, ChevronRight,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import BiblioLogo from "@/components/BiblioLogo";
import { useState, useEffect } from "react";
import { obtenirInfoBibliotheque } from "@/lib/api";

type NavItem = { title: string; url: string; icon: React.ElementType; badge?: "notifications" };

const itemsAdmin: NavItem[] = [
  { title: "Tableau de bord", url: "/tableau-de-bord", icon: LayoutDashboard },
  { title: "Catalogue",       url: "/livres",          icon: BookOpen },
  { title: "Emprunts",        url: "/emprunts",         icon: ArrowLeftRight },
  { title: "Réservations",    url: "/reservations",     icon: CalendarClock },
  { title: "Pénalités",       url: "/penalites",        icon: AlertTriangle },
  { title: "Notifications",   url: "/notifications",    icon: Bell, badge: "notifications" },
];

const itemsMembre: NavItem[] = [
  { title: "Catalogue",        url: "/livres",       icon: BookOpen },
  { title: "Mes emprunts",     url: "/emprunts",      icon: ArrowLeftRight },
  { title: "Mes réservations", url: "/reservations",  icon: CalendarClock },
  { title: "Mes pénalités",    url: "/penalites",     icon: AlertTriangle },
  { title: "Notifications",    url: "/notifications", icon: Bell, badge: "notifications" },
  { title: "Ma bibliothèque",  url: "/bibliotheque",  icon: Info },
  { title: "Paramètres",       url: "/parametres",    icon: Settings },
];

const itemsAdminGestion: NavItem[] = [
  { title: "Utilisateurs",  url: "/admin/utilisateurs", icon: Users },
  { title: "Codes d'accès", url: "/admin/codes-acces",  icon: KeyRound },
  { title: "Paramètres",    url: "/admin/parametres",   icon: Settings },
];

function useBiblioInfo() {
  const [nomBiblio, setNomBiblio]   = useState("BiblioTech");
  const [logoBiblio, setLogoBiblio] = useState<string | null>(null);

  const recharger = () => {
    obtenirInfoBibliotheque()
      .then(d => {
        if (d?.nom)  setNomBiblio(d.nom);
        if (d?.logo) setLogoBiblio(d.logo);
        else         setLogoBiblio(null);
      })
      .catch(() => {});
  };

  useEffect(() => {
    recharger();
    const id = setInterval(recharger, 10000);
    return () => clearInterval(id);
  }, []);

  return { nomBiblio, logoBiblio };
}

export function AppSidebar() {
  const { utilisateur, deconnecter, nonLues } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();
  const estAdmin = utilisateur?.role === "admin";
  const navItems = estAdmin ? itemsAdmin : itemsMembre;
  const { nomBiblio, logoBiblio } = useBiblioInfo();

  // Fermer la sidebar sur mobile lors d'un clic sur un item
  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  const initiales = utilisateur?.nom
    ? utilisateur.nom.charAt(0).toUpperCase()
    : utilisateur?.email
    ? utilisateur.email.charAt(0).toUpperCase()
    : "?";

  return (
    <Sidebar className="border-r border-sidebar-border/60" style={{
      background: "hsl(var(--sidebar-background) / 0.85)",
      backdropFilter: "blur(32px) saturate(180%)",
      WebkitBackdropFilter: "blur(32px) saturate(180%)",
    }}>
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {logoBiblio
              ? <img src={logoBiblio} alt={nomBiblio} className="h-9 w-9 rounded-xl object-cover border border-primary/20" />
              : <BiblioLogo size={36} />
            }
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-sidebar-background" />
          </div>
          <div>
            <h2 className="font-display text-sm font-bold text-sidebar-accent-foreground tracking-tight leading-tight truncate max-w-[140px]">
              {nomBiblio}
            </h2>
            <p className="text-[10px] text-muted-foreground">Gestion de bibliothèque</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 py-3 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] uppercase tracking-widest text-muted-foreground/50 px-3 mb-1.5">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end onClick={handleNavClick}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground transition-all duration-200 group"
                      activeClassName="nav-active">
                      <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                      <span className="flex-1 font-medium">{item.title}</span>
                      {item.badge === "notifications" && nonLues > 0 && (
                        <span className="h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
                          {nonLues > 99 ? "99+" : nonLues}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {estAdmin && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-[9px] uppercase tracking-widest text-muted-foreground/50 px-3 mb-1.5">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {itemsAdminGestion.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end onClick={handleNavClick}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground transition-all duration-200 group"
                        activeClassName="nav-active">
                        <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                        <span className="flex-1 font-medium">{item.title}</span>
                        <ChevronRight className="h-3 w-3 opacity-30 group-hover:opacity-60 transition-opacity" />
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer profil */}
      <SidebarFooter className="p-3 border-t border-sidebar-border/50">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-sidebar-accent/40 transition-colors">
          {utilisateur?.photo_profil
            ? <img src={utilisateur.photo_profil} alt="profil" className="h-8 w-8 rounded-full object-cover border border-primary/30 shrink-0" />
            : <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary shrink-0">{initiales}</div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-accent-foreground truncate">
              {utilisateur?.nom ?? (estAdmin ? "Admin" : "Membre")}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{utilisateur?.email ?? ""}</p>
          </div>
          <button onClick={deconnecter}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            title="Se déconnecter">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[9px] text-muted-foreground/30 text-center mt-2">
          © 2026 BiblioTech — Développé par AFELI YB
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
