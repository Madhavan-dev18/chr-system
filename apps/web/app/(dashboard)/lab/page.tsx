import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LabDashboard() {
  const session = await auth();
  
  if (session?.user?.role !== 'LAB_TECH') {
    redirect('/unauthorized');
  }

  return (
    <div className="p-8 space-y-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Laboratory</h1>
        <p className="text-[#9898B8] mt-1 text-sm font-medium">Pending lab orders and results</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl p-6 bg-[#F2F4FA] shadow-[6px_6px_12px_#C8CAD4,-6px_-6px_12px_#FFFFFF]">
          <h3 className="text-lg font-bold text-[#1E2035] mb-2">Pending Orders</h3>
          <p className="text-3xl font-black text-[#E84545]">15</p>
        </div>
        <div className="rounded-3xl p-6 bg-[#F2F4FA] shadow-[6px_6px_12px_#C8CAD4,-6px_-6px_12px_#FFFFFF]">
          <h3 className="text-lg font-bold text-[#1E2035] mb-2">Results Entered Today</h3>
          <p className="text-3xl font-black text-[#27AE60]">47</p>
        </div>
      </div>
    </div>
  );
}
