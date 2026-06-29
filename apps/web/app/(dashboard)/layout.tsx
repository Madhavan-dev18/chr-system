import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

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

  // We could also do layout-level role checks here, but since the (dashboard) 
  // is shared across all 6 roles, we just ensure they are authenticated.
  // The specific sub-folders (e.g. /admin, /doctor) will have their own page-level or layout-level checks.

  return (
    <div className="flex h-screen bg-[#EEF0F5]">
      {/* Sidebar navigation goes here */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
