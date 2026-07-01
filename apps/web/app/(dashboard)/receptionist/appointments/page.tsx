'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Calendar, Clock, Plus, Search, User } from 'lucide-react';

export default function ReceptionistAppointments() {
  const [isBooking, setIsBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Forms
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [reason, setReason] = useState('');

  // Fetch appointments for the selected date
  const { data: appointmentsData, refetch } = trpc.appointments.list.useQuery({
    from: new Date(`${selectedDate}T00:00:00.000Z`).toISOString(),
    to: new Date(`${selectedDate}T23:59:59.999Z`).toISOString(),
  });
  const appointments = appointmentsData?.appointments ?? [];

  // Mock fetching patients & doctors for the dropdown
  // In a real app we'd have dedicated TRPC endpoints for typeahead searching
  const { data: patientsData } = trpc.patients.list.useQuery({});
  const patients = patientsData?.patients ?? [];
  
  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      setIsBooking(false);
      refetch();
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId || !startTime) return;
    
    // Construct ISO string for the selected time on the selected date
    const startIso = new Date(`${selectedDate}T${startTime}:00.000Z`).toISOString();
    
    // Assume 30 min duration
    const endIso = new Date(new Date(startIso).getTime() + 30 * 60000).toISOString();

    createMutation.mutate({
      patientId,
      doctorId,
      scheduledStart: startIso,
      durationMinutes: 30,
      chiefComplaint: reason,
      appointmentType: 'CONSULTATION',
    });
  };

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Appointments</h1>
          <p className="text-[#9898B8] mt-1 text-sm font-medium">Manage clinic schedule and book patients</p>
        </div>
        <button 
          onClick={() => setIsBooking(!isBooking)}
          className="flex items-center gap-2 px-6 py-3 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 active:scale-95"
          style={{
            background: '#FF6B35',
            boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF',
          }}
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          {isBooking ? 'Cancel Booking' : 'Book Appointment'}
        </button>
      </header>

      {isBooking && (
        <div className="rounded-3xl p-6 mb-8" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
          <h2 className="text-xl font-bold text-[#1E2035] mb-6">New Appointment</h2>
          <form onSubmit={handleBook} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9898B8] uppercase">Patient</label>
              <select 
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none"
                style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
                required
              >
                <option value="">Select Patient...</option>
                {patients?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9898B8] uppercase">Doctor (Placeholder ID)</label>
              {/* Note: We should fetch clinic doctors. For now, free-text or mock ID */}
              <input 
                type="text"
                placeholder="Enter Doctor UUID"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none"
                style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9898B8] uppercase">Time (on {selectedDate})</label>
              <input 
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none"
                style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9898B8] uppercase">Reason</label>
              <input 
                type="text"
                placeholder="Brief reason for visit"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none"
                style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
              />
            </div>

            <div className="md:col-span-2 pt-4 flex justify-end">
              <button 
                type="submit"
                disabled={createMutation.isPending}
                className="px-8 py-3 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                style={{ background: '#4A90D9', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }}
              >
                {createMutation.isPending ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Calendar View */}
      <div className="rounded-3xl p-6" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-[#1E2035]">Schedule</h2>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 text-sm text-[#5A5A7A] font-semibold rounded-xl outline-none"
              style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {appointments?.length === 0 ? (
            <div className="p-8 text-center text-[#9898B8] font-medium">
              No appointments scheduled for this date.
            </div>
          ) : (
            appointments?.map((apt: any) => (
              <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl bg-[#EEF0F5] transition-all hover:shadow-[inset_2px_2px_5px_#C8CAD4,inset_-2px_-2px_5px_#FFFFFF]">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center justify-center w-16 text-[#4A90D9]">
                    <span className="text-lg font-black">{new Date(apt.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-[#1E2035] flex items-center gap-2">
                      <User className="w-4 h-4 text-[#9898B8]" />
                      {apt.patient.firstName} {apt.patient.lastName}
                    </h3>
                    <p className="text-xs font-mono text-[#9898B8] mt-1">{apt.patient.mrn} • Doctor: {apt.doctor.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    apt.status === 'PENDING' ? 'bg-[#F39C12]/10 text-[#F39C12]' :
                    apt.status === 'CONFIRMED' ? 'bg-[#4A90D9]/10 text-[#4A90D9]' :
                    apt.status === 'COMPLETED' ? 'bg-[#27AE60]/10 text-[#27AE60]' :
                    'bg-[#E84545]/10 text-[#E84545]'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
