import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/40 px-4 bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-border/60 mx-1" />
          <span className="text-xs text-muted-foreground font-medium">BiblioTech</span>
        </header>
        <main className="flex-1 p-5 md:p-7 overflow-auto bg-animated min-h-screen">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
