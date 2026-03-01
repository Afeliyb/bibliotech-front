import {
  BookOpen, ArrowLeftRight, CalendarClock, AlertTriangle,
  Bell, Settings, Users, LayoutDashboard, KeyRound,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import EsgisLogo from "@/components/EsgisLogo";

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: "notifications";
};

const adminMainItems: NavItem[] = [
  { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard },
  { title: "Catalogue", url: "/books", icon: BookOpen },
  { title: "Emprunts", url: "/borrowings", icon: ArrowLeftRight },
  { title: "Réservations", url: "/reservations", icon: CalendarClock },
  { title: "Pénalités", url: "/penalties", icon: AlertTriangle },
  { title: "Notifications", url: "/notifications", icon: Bell, badge: "notifications" },
];

const memberItems: NavItem[] = [
  { title: "Catalogue", url: "/books", icon: BookOpen },
  { title: "Mes emprunts", url: "/borrowings", icon: ArrowLeftRight },
  { title: "Mes réservations", url: "/reservations", icon: CalendarClock },
  { title: "Mes pénalités", url: "/penalties", icon: AlertTriangle },
  { title: "Notifications", url: "/notifications", icon: Bell, badge: "notifications" },
  { title: "Paramètres", url: "/settings", icon: Settings },
];

const adminItems: NavItem[] = [
  { title: "Utilisateurs", url: "/admin/users", icon: Users },
  { title: "Codes d'accès", url: "/admin/access-codes", icon: KeyRound },
  { title: "Paramètres", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { user, logout, unreadCount } = useAuth();
  const isAdmin = user?.role === "admin";
  const navItems = isAdmin ? adminMainItems : memberItems;

  const initials = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "?";

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <EsgisLogo size={36} />
          <div>
            <h2 className="font-display text-sm font-bold text-sidebar-accent-foreground tracking-tight">
              ESGIS Library
            </h2>
            <p className="text-[10px] text-muted-foreground">Gestion de bibliothèque</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3 mb-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                      activeClassName="bg-primary/10 text-primary border border-primary/20"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge === "notifications" && unreadCount > 0 && (
                        <span className="h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3 mb-1 mt-4">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                        activeClassName="bg-primary/10 text-primary border border-primary/20"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2">
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt="profil"
              className="h-8 w-8 rounded-full object-cover border border-primary/30" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-accent-foreground truncate">
              {user?.name ?? (isAdmin ? "Admin" : "Adhérent")}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email ?? ""}</p>
          </div>
          <Button size="sm" variant="outline" onClick={logout} className="text-xs">
            Déconnexion
          </Button>
        </div>
        {/* Signature */}
        <p className="text-[9px] text-muted-foreground/40 text-center mt-2">
          © 2026 ESGIS Library — Developed by AFELI YB
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
