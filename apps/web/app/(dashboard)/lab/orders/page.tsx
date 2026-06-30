import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LabOrdersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'LAB_TECH') {
    redirect('/unauthorized');
  }

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Lab & Vitals</h1>
          <p className="text-[#9898B8] mt-1 text-sm font-medium">Record patient vitals and manage lab orders</p>
        </div>
        <button className="px-6 py-2.5 rounded-xl font-semibold text-white bg-[#4A90D9] transition-all" style={{ boxShadow: '0 4px 14px rgba(74,144,217,0.35)' }}>
          + Record Vitals
        </button>
      </header>

      {/* Neumorphic Card holding the Data Table */}
      <div 
        className="rounded-3xl p-6"
        style={{
          background: '#F2F4FA',
          boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF',
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1E2035]">Recent Records</h2>
          <input 
            type="text" 
            placeholder="Search MRN or Patient Name..." 
            className="w-72 px-4 py-2 text-sm text-[#5A5A7A] rounded-xl outline-none"
            style={{
              background: '#EEF0F5',
              boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF',
            }}
          />
        </div>

        <div className="w-full text-left text-sm text-[#5A5A7A]">
          <div className="grid grid-cols-5 gap-4 px-4 py-3 font-semibold text-[#9898B8] border-b border-[#C8CAD4]/30 uppercase text-xs tracking-wider">
            <div>MRN</div>
            <div>Patient Name</div>
            <div>Recorded At</div>
            <div>Vitals Summary</div>
            <div>Actions</div>
          </div>
          
          {/* Placeholder Row 1 */}
          <div className="grid grid-cols-5 gap-4 px-4 py-4 items-center transition-colors hover:bg-[#EEF0F5]/50 rounded-xl mt-2 cursor-pointer">
            <div className="font-mono text-[#4A90D9] font-medium">MRN-202606-0001</div>
            <div className="font-semibold text-[#1E2035]">Priya Nair</div>
            <div className="text-xs text-[#5A5A7A]">Today, 09:15 AM</div>
            <div className="font-mono text-xs">
              <span className="text-[#E84545] font-semibold">120/80</span> mmHg<br/>
              <span className="text-[#27AE60] font-semibold">98</span>% SpO2
            </div>
            <div>
              <Link href="#" className="text-[#4A90D9] font-semibold hover:underline">
                View Details &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
