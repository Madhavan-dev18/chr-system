import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ReceptionistDashboard() {
  const session = await auth();
  
  if (session?.user?.role !== 'RECEPTIONIST') {
    redirect('/unauthorized');
  }

  return (
    <div className="p-8 space-y-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Front Desk</h1>
        <p className="text-[#9898B8] mt-1 text-sm font-medium">Manage patients and appointments</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl p-6 bg-[#F2F4FA] shadow-[6px_6px_12px_#C8CAD4,-6px_-6px_12px_#FFFFFF]">
          <h3 className="text-lg font-bold text-[#1E2035] mb-2">Today's Appointments</h3>
          <p className="text-3xl font-black text-[#4A90D9]">42</p>
        </div>
        <div className="rounded-3xl p-6 bg-[#F2F4FA] shadow-[6px_6px_12px_#C8CAD4,-6px_-6px_12px_#FFFFFF]">
          <h3 className="text-lg font-bold text-[#1E2035] mb-2">Check-ins Pending</h3>
          <p className="text-3xl font-black text-[#F39C12]">12</p>
        </div>
      </div>
    </div>
  );
}
