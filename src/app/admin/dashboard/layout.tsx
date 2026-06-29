import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";

const adminUser = {
  name: "Admin",
  email: "admin1@medisafe.com",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <DashboardHeader user={adminUser} isAdmin={true} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
