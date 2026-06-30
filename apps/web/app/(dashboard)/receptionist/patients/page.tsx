import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PatientRegistryClient } from './PatientRegistryClient';

export default async function ReceptionistPatientsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'RECEPTIONIST') {
    redirect('/unauthorized');
  }

  return (
    <div className="p-8">
      <PatientRegistryClient />
    </div>
  );
}
