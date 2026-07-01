import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getRoleDashboardUrl } from '@/lib/utils';

export default async function Home() {
  const session = await auth();
  if (session?.user?.role) {
    redirect(getRoleDashboardUrl(session.user.role));
  }
  redirect('/login');
}
