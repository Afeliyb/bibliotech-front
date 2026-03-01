import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/context/AuthContext";
import EsgisLogo from "@/components/EsgisLogo";

const UserAvatar = () => {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "?";

  if (user?.profile_picture) {
    return (
      <img src={user.profile_picture} alt="profil"
        className="h-8 w-8 rounded-full object-cover border border-primary/30" />
    );
  }
  return (
    <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-medium text-primary">
      {initials}
    </div>
  );
};

const Layout = ({ children }: { children: ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-14 flex items-center border-b border-border/50 px-4 glass sticky top-0 z-30">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div className="ml-3 flex items-center gap-2 hidden sm:flex">
            <EsgisLogo size={22} />
            <span className="text-xs font-semibold text-muted-foreground">ESGIS Library</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <UserAvatar />
          </div>
        </header>
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  </SidebarProvider>
);

export default Layout;
