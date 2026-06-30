import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  if (session?.user?.role) {
    // Logged-in user: route to their role-appropriate dashboard
    switch (session.user.role) {
      case 'ADMIN': redirect('/admin/patients');
      case 'DOCTOR': redirect('/doctor/patients');
      case 'NURSE': redirect('/nurse/patients');
      case 'PATIENT': redirect('/patient');
      case 'RECEPTIONIST': redirect('/receptionist/patients');
      case 'LAB_TECH': redirect('/lab/orders');
      default: redirect('/unauthorized');
    }
  }

  // Not logged in: send to login
  redirect('/login');
}
