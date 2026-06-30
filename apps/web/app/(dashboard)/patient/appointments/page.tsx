'use client';

import { trpc } from '@/lib/trpc/client';
import { useSession } from 'next-auth/react';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PatientAppointments() {
  const { data: session } = useSession();
  
  // We need to fetch the patient's internal ID first
  const { data: profile } = trpc.patients.getById.useQuery({ id: session?.user?.id as string }, { enabled: !!session?.user?.id });

  const { data: appointments } = trpc.appointments.list.useQuery({ 
    patientId: profile?.id as string 
  }, { enabled: !!profile?.id });

  const upcoming = appointments?.filter((a: any) => new Date(a.scheduledStart).getTime() > Date.now() && a.status !== 'CANCELLED') || [];
  const past = appointments?.filter((a: any) => new Date(a.scheduledStart).getTime() <= Date.now() || a.status === 'CANCELLED') || [];

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">My Appointments</h1>
        <p className="text-[#9898B8] mt-1 text-sm font-medium">View upcoming visits and manage your schedule</p>
      </header>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#1E2035] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#4A90D9]" />
          Upcoming Visits
        </h2>
        
        {upcoming.length === 0 ? (
          <div className="rounded-3xl p-12 text-center" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
            <Calendar className="w-12 h-12 text-[#9898B8] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-[#1E2035]">No upcoming appointments</h3>
            <p className="text-[#9898B8] font-medium mt-2">You don't have any visits scheduled. Please call the clinic to book.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcoming.map((apt: any) => (
              <div key={apt.id} className="rounded-3xl p-6 relative overflow-hidden" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
                {/* Accent line */}
                <div className="absolute top-0 left-0 w-2 h-full bg-[#4A90D9]"></div>
                
                <div className="flex justify-between items-start pl-2">
                  <div>
                    <h3 className="text-2xl font-black text-[#1E2035]">{new Date(apt.scheduledStart).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
                    <div className="flex items-center gap-2 text-[#5A5A7A] mt-2 font-bold text-sm">
                      <Clock className="w-4 h-4 text-[#4A90D9]" />
                      {new Date(apt.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    apt.status === 'CONFIRMED' ? 'bg-[#27AE60]/10 text-[#27AE60]' : 'bg-[#F39C12]/10 text-[#F39C12]'
                  }`}>
                    {apt.status}
                  </span>
                </div>
                
                <div className="mt-6 pt-4 border-t border-[#C8CAD4]/30 pl-2">
                  <p className="font-bold text-[#1E2035]">{apt.type}</p>
                  <p className="text-sm text-[#5A5A7A] mt-1 line-clamp-2">{apt.reason || 'Routine visit'}</p>
                  
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#9898B8]">
                    <MapPin className="w-4 h-4" />
                    Central Hospital (Main Campus)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 mt-12">
        <h2 className="text-xl font-bold text-[#1E2035] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#9898B8]" />
          Past Visits
        </h2>
        
        <div className="rounded-3xl p-6" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
          <div className="space-y-4">
            {past.length === 0 ? (
              <p className="text-center text-[#9898B8] text-sm">No past visits recorded.</p>
            ) : (
              past.map((apt: any) => (
                <div key={apt.id} className="flex justify-between items-center p-4 rounded-xl bg-[#EEF0F5] opacity-80">
                  <div>
                    <h3 className="font-bold text-[#1E2035]">
                      {new Date(apt.scheduledStart).toLocaleDateString()}
                    </h3>
                    <p className="text-xs text-[#9898B8] mt-1">{apt.type} • Dr. {apt.doctor?.email?.split('@')[0] || 'Unknown'}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      apt.status === 'COMPLETED' ? 'text-[#27AE60]' :
                      apt.status === 'CANCELLED' ? 'text-[#E84545]' : 'text-[#9898B8]'
                    }`}>
                      {apt.status}
                    </span>
                    {apt.status === 'COMPLETED' && (
                      <Link href="/patient/records" className="text-[10px] font-bold text-[#4A90D9] mt-1 hover:underline">
                        View Records
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
