import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DoctorDashboard() {
  const session = await auth();
  
  if (session?.user?.role !== 'DOCTOR') {
    redirect('/unauthorized');
  }

  return (
    <div className="p-8 space-y-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Doctor Overview</h1>
        <p className="text-[#9898B8] mt-1 text-sm font-medium">Your daily schedule and patient metrics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl p-6 bg-[#F2F4FA] shadow-[6px_6px_12px_#C8CAD4,-6px_-6px_12px_#FFFFFF]">
          <h3 className="text-lg font-bold text-[#1E2035] mb-2">Today's Appointments</h3>
          <p className="text-3xl font-black text-[#4A90D9]">8</p>
        </div>
        <div className="rounded-3xl p-6 bg-[#F2F4FA] shadow-[6px_6px_12px_#C8CAD4,-6px_-6px_12px_#FFFFFF]">
          <h3 className="text-lg font-bold text-[#1E2035] mb-2">Pending Labs</h3>
          <p className="text-3xl font-black text-[#E84545]">3</p>
        </div>
        <div className="rounded-3xl p-6 bg-[#F2F4FA] shadow-[6px_6px_12px_#C8CAD4,-6px_-6px_12px_#FFFFFF]">
          <h3 className="text-lg font-bold text-[#1E2035] mb-2">Total Patients</h3>
          <p className="text-3xl font-black text-[#27AE60]">342</p>
        </div>
      </div>
    </div>
  );
}
