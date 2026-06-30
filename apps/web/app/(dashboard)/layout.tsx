import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Secondary Firewall: If the Edge middleware is bypassed (or fails), 
  // the React Server Component will refuse to render the dashboard layout.
  if (!session?.user) {
    redirect('/login');
  }

  // Extract user details
  const userName = session.user.name || session.user.email?.split('@')[0] || 'User';
  const userRole = session.user.role;

  return (
    <div className="flex h-screen bg-[#EEF0F5] overflow-hidden">
      <Sidebar userRole={userRole} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName={userName} userRole={userRole} />
        
        <main className="flex-1 overflow-y-auto bg-[#EEF0F5] rounded-tl-3xl shadow-[inset_6px_6px_12px_#C8CAD4]">
          {children}
        </main>
      </div>
    </div>
  );
}
