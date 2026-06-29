import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function NursePatientsDashboard() {
  const session = await auth();
  
  if (session?.user?.role !== 'NURSE') {
    redirect('/unauthorized');
  }

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Assigned Patients</h1>
          <p className="text-[#9898B8] mt-1 text-sm font-medium">View patients and record vitals</p>
        </div>
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
          <h2 className="text-xl font-bold text-[#1E2035]">Ward Roster</h2>
          <input 
            type="text" 
            placeholder="Search MRN or Name..." 
            className="w-64 px-4 py-2 text-sm text-[#5A5A7A] rounded-xl outline-none"
            style={{
              background: '#EEF0F5',
              boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF',
            }}
          />
        </div>

        <div className="w-full text-left text-sm text-[#5A5A7A]">
          <div className="grid grid-cols-5 gap-4 px-4 py-3 font-semibold text-[#9898B8] border-b border-[#C8CAD4]/30 uppercase text-xs tracking-wider">
            <div>MRN</div>
            <div>Name</div>
            <div>Latest Vitals</div>
            <div>Assigned Doctor</div>
            <div>Actions</div>
          </div>
          
          {/* Placeholder Row */}
          <div className="grid grid-cols-5 gap-4 px-4 py-4 items-center transition-colors hover:bg-[#EEF0F5]/50 rounded-xl mt-2 cursor-pointer">
            <div className="font-mono text-[#4A90D9] font-medium">MRN-202606-0001</div>
            <div className="font-semibold text-[#1E2035]">John Doe</div>
            <div className="font-mono text-xs">
              <span className="text-[#E84545] font-semibold">140/90</span> mmHg<br/>
              <span className="text-[#27AE60] font-semibold">98</span>% SpO2
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4A90D9]/10 text-[#4A90D9]">
                Dr. Test
              </span>
            </div>
            <div className="flex gap-2">
              <button className="text-[#FF6B35] font-semibold hover:underline">Record Vitals</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
