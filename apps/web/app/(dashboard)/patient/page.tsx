import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PatientPortalDashboard() {
  const session = await auth();
  
  if (session?.user?.role !== 'PATIENT') {
    redirect('/unauthorized');
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Welcome, John</h1>
        <p className="text-[#9898B8] mt-2 text-sm font-medium">Your personal health portal</p>
      </header>

      {/* Neumorphic Grid for Patient Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <div 
          className="rounded-3xl p-6 flex flex-col"
          style={{
            background: '#F2F4FA',
            boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF',
          }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 self-center"
            style={{
              background: '#EEF0F5',
              boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF',
              color: '#4A90D9'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-[#1E2035] text-center mb-6">Demographics</h2>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-[#C8CAD4]/30 pb-2">
              <span className="text-[#9898B8] font-semibold">MRN</span>
              <span className="font-mono text-[#1E2035] font-semibold">MRN-202606-0001</span>
            </div>
            <div className="flex justify-between border-b border-[#C8CAD4]/30 pb-2">
              <span className="text-[#9898B8] font-semibold">DOB</span>
              <span className="text-[#1E2035] font-semibold">Jan 1, 1980</span>
            </div>
            <div className="flex justify-between border-b border-[#C8CAD4]/30 pb-2">
              <span className="text-[#9898B8] font-semibold">Blood Type</span>
              <span className="text-[#E84545] font-semibold">O+</span>
            </div>
          </div>
        </div>

        {/* Latest Vitals Card */}
        <div 
          className="rounded-3xl p-6 flex flex-col"
          style={{
            background: '#F2F4FA',
            boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF',
          }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 self-center"
            style={{
              background: '#EEF0F5',
              boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF',
              color: '#E84545'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-[#1E2035] text-center mb-6">Latest Vitals</h2>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b border-[#C8CAD4]/30 pb-2">
              <span className="text-[#9898B8] font-semibold">Blood Pressure</span>
              <span className="text-[#E84545] font-bold">140/90 <span className="text-xs font-normal">mmHg</span></span>
            </div>
            <div className="flex justify-between border-b border-[#C8CAD4]/30 pb-2">
              <span className="text-[#9898B8] font-semibold">Heart Rate</span>
              <span className="text-[#1E2035] font-bold">82 <span className="text-xs font-normal">bpm</span></span>
            </div>
            <div className="flex justify-between border-b border-[#C8CAD4]/30 pb-2">
              <span className="text-[#9898B8] font-semibold">Oxygen (SpO2)</span>
              <span className="text-[#27AE60] font-bold">98 <span className="text-xs font-normal">%</span></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
