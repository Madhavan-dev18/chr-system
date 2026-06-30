import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ReceptionistPatientsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'RECEPTIONIST') {
    redirect('/unauthorized');
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div 
          className="p-8 rounded-3xl"
          style={{
            boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF',
          }}
        >
          <h1 className="text-2xl font-bold font-sans text-[#2D3142] mb-2">
            Patient Registration
          </h1>
          <p className="text-sm font-mono text-gray-500 mb-6">
            Receptionist Dashboard
          </p>
          <div 
            className="p-6 rounded-2xl text-center text-gray-400"
            style={{
              boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF',
            }}
          >
            <p className="text-lg">Patient registration and scheduling — coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
