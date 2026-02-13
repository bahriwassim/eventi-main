import { AdminSidebar } from "@/components/admin/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminAuthWrapper from "./AdminAuthWrapper";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminAuthWrapper>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <main className="flex-1 p-4 md:p-8 bg-background/50">{children}</main>
            <footer className="py-4 px-8 border-t border-white/5 text-center text-xs text-muted-foreground bg-background/50 mt-auto">
                © {new Date().getFullYear()} Eventi Admin Dashboard
            </footer>
          </div>
        </div>
      </SidebarProvider>
    </AdminAuthWrapper>
  );
}
