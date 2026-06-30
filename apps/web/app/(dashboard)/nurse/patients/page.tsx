import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NursePatientsClient } from './NursePatientsClient';

export default async function NursePatientsDashboard() {
  const session = await auth();
  
  if (session?.user?.role !== 'NURSE') {
    redirect('/unauthorized');
  }

  return (
    <div className="p-8">
      <NursePatientsClient />
    </div>
  );
}
