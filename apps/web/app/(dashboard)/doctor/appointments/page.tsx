'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Calendar, User, Clock, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function DoctorAppointments() {
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const { data: appointmentsData, refetch } = trpc.appointments.list.useQuery({
    from: new Date(`${selectedDate}T00:00:00.000Z`).toISOString(),
    to: new Date(`${selectedDate}T23:59:59.999Z`).toISOString(),
    doctorId: session?.user?.id,
  }, {
    enabled: !!session?.user?.id,
  });

  const appointments = appointmentsData?.appointments ?? [];
  const updateStatusMutation = trpc.appointments.updateStatus.useMutation({
    onSuccess: () => refetch()
  });

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">My Schedule</h1>
          <p className="text-[#9898B8] mt-1 text-sm font-medium">View your daily appointments and manage patient flow</p>
        </div>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-6 py-3 text-sm text-[#1E2035] font-bold rounded-xl outline-none"
          style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
        />
      </header>

      <div className="grid gap-6">
        {appointments?.length === 0 ? (
          <div className="rounded-3xl p-12 text-center" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
            <Calendar className="w-12 h-12 text-[#9898B8] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-[#1E2035]">No Appointments</h3>
            <p className="text-[#9898B8] font-medium mt-2">You have a clear schedule for this day.</p>
          </div>
        ) : (
          appointments?.map((apt: any) => (
            <div key={apt.id} className="rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:scale-[1.01]" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
              
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-[#EEF0F5] shadow-[inset_4px_4px_8px_#C8CAD4,inset_-4px_-4px_8px_#FFFFFF] text-[#4A90D9]">
                  <span className="text-xl font-black">{new Date(apt.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-[#1E2035] flex items-center gap-2">
                    {apt.patient.firstName} {apt.patient.lastName}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-mono text-[#9898B8] mt-2">
                    <span className="bg-[#EEF0F5] px-2 py-1 rounded-md">{apt.patient.mrn}</span>
                    <span className="bg-[#EEF0F5] px-2 py-1 rounded-md">DOB: {new Date(apt.patient.dob).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                {apt.reason && (
                  <p className="text-sm text-[#5A5A7A] italic mr-4 flex-1 text-center md:text-left">"{apt.reason}"</p>
                )}

                <div className="flex items-center gap-3">
                  {apt.status === 'PENDING' && (
                    <button 
                      onClick={() => updateStatusMutation.mutate({ id: apt.id, status: 'CONFIRMED' })}
                      className="px-4 py-2 bg-[#EEF0F5] text-[#4A90D9] font-bold text-xs rounded-lg shadow-[4px_4px_8px_#C8CAD4,-4px_-4px_8px_#FFFFFF] hover:text-white hover:bg-[#4A90D9]"
                    >
                      Confirm
                    </button>
                  )}
                  
                  {apt.status === 'CONFIRMED' && (
                    <button 
                      onClick={() => updateStatusMutation.mutate({ id: apt.id, status: 'COMPLETED' })}
                      className="px-4 py-2 bg-[#EEF0F5] text-[#27AE60] font-bold text-xs rounded-lg shadow-[4px_4px_8px_#C8CAD4,-4px_-4px_8px_#FFFFFF] hover:text-white hover:bg-[#27AE60]"
                    >
                      Mark Complete
                    </button>
                  )}

                  <Link 
                    href={`/doctor/patients/${apt.patient.mrn}`}
                    className="px-6 py-3 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 active:scale-95"
                    style={{ background: '#FF6B35', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }}
                  >
                    Open Chart
                  </Link>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
