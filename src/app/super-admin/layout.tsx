import { SuperAdminSidebar } from "@/components/super-admin/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import SuperAdminAuthWrapper from "./SuperAdminAuthWrapper";

export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SuperAdminAuthWrapper>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <SuperAdminSidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <main className="flex-1 p-4 md:p-8 bg-background/50">{children}</main>
             {/* Footer removed or simplified for dashboard to avoid broken links/layout issues */}
             <footer className="py-4 px-8 border-t border-white/5 text-center text-xs text-muted-foreground bg-background/50">
                © {new Date().getFullYear()} Evanti Super Admin Dashboard
            </footer>
          </div>
        </div>
      </SidebarProvider>
    </SuperAdminAuthWrapper>
  );
}
