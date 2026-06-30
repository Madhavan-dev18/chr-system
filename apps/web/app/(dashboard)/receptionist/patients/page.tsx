import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ReceptionistPatientsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'RECEPTIONIST') {
    redirect('/unauthorized');
  }

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Patient Registry</h1>
          <p className="text-[#9898B8] mt-1 text-sm font-medium">Manage clinic patients and registration</p>
        </div>
        <button className="px-6 py-2.5 rounded-xl font-semibold text-white bg-[#FF6B35] transition-all" style={{ boxShadow: '0 4px 14px rgba(255,107,53,0.35)' }}>
          + Register Patient
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
          <h2 className="text-xl font-bold text-[#1E2035]">All Patients</h2>
          <input 
            type="text" 
            placeholder="Search MRN, Name, or Phone..." 
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
            <div>Name</div>
            <div>Contact</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          
          {/* Placeholder Row 1 */}
          <div className="grid grid-cols-5 gap-4 px-4 py-4 items-center transition-colors hover:bg-[#EEF0F5]/50 rounded-xl mt-2 cursor-pointer">
            <div className="font-mono text-[#4A90D9] font-medium">MRN-202606-0001</div>
            <div className="font-semibold text-[#1E2035]">Priya Nair</div>
            <div className="text-xs text-[#5A5A7A]">+91 98765 43210</div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#27AE60]/10 text-[#27AE60]">
                Active
              </span>
            </div>
            <div>
              <Link href="#" className="text-[#FF6B35] font-semibold hover:underline">
                Edit Profile &rarr;
              </Link>
            </div>
          </div>

          {/* Placeholder Row 2 */}
          <div className="grid grid-cols-5 gap-4 px-4 py-4 items-center transition-colors hover:bg-[#EEF0F5]/50 rounded-xl mt-2 cursor-pointer">
            <div className="font-mono text-[#4A90D9] font-medium">MRN-202606-0002</div>
            <div className="font-semibold text-[#1E2035]">Karthik Rajan</div>
            <div className="text-xs text-[#5A5A7A]">+91 91234 56789</div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4A90D9]/10 text-[#4A90D9]">
                Discharged
              </span>
            </div>
            <div>
              <Link href="#" className="text-[#FF6B35] font-semibold hover:underline">
                Edit Profile &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
