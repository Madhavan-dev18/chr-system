'use client';

import { trpc } from '@/lib/trpc/client';
import { useSession } from 'next-auth/react';
import { Pill, Activity, FlaskConical, Calendar, FileText } from 'lucide-react';

export default function PatientRecords() {
  const { data: session } = useSession();
  const patientId = 'me'; // TRPC endpoints will resolve to the current patient

  // We need to fetch the patient's internal ID first
  const { data: profile } = trpc.patients.getById.useQuery({ id: session?.user?.id || '' }, { enabled: !!session?.user?.id });

  const { data: prescriptions } = trpc.prescriptions.list.useQuery({ patientId: profile?.id || '' }, { enabled: !!profile?.id });
  const { data: labs } = trpc.labs.list.useQuery({ patientId: profile?.id || '' }, { enabled: !!profile?.id });
  const { data: vitals } = trpc.vitals.listByPatient.useQuery({ patientId: profile?.id || '' }, { enabled: !!profile?.id });

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">My Records</h1>
        <p className="text-[#9898B8] mt-1 text-sm font-medium">Access your health data, vitals, and lab results</p>
      </header>

      {/* Profile Summary */}
      {profile && (
        <div className="rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
          <div>
            <h2 className="text-2xl font-black text-[#1E2035]">{profile.firstName} {profile.lastName}</h2>
            <p className="text-[#9898B8] font-mono mt-1">{profile.mrn}</p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#9898B8]">Blood Type</p>
              <p className="text-xl font-bold text-[#E84545]">{profile.bloodType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#9898B8]">DOB</p>
              <p className="text-lg font-bold text-[#1E2035]">{new Date(profile.dob).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Prescriptions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1E2035] flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#4A90D9]" />
            Active Medications
          </h2>
          <div className="rounded-3xl p-6" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
            <div className="space-y-4">
              {prescriptions?.filter((p: any) => p.isActive).length === 0 ? (
                <p className="text-center text-[#9898B8] text-sm">No active medications.</p>
              ) : (
                prescriptions?.filter((p: any) => p.isActive).map((rx: any) => (
                  <div key={rx.id} className="p-4 rounded-xl bg-[#EEF0F5] shadow-[inset_2px_2px_5px_#C8CAD4,inset_-2px_-2px_5px_#FFFFFF]">
                    <h3 className="font-bold text-[#1E2035]">{rx.medicationName} <span className="text-[#5A5A7A] font-medium text-sm">{rx.dosage}{rx.unit}</span></h3>
                    <p className="text-xs text-[#9898B8] mt-1">{rx.frequency} • {rx.route || 'Oral'}</p>
                    {rx.notes && <p className="text-xs text-[#5A5A7A] italic mt-2">Note: {rx.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Latest Vitals */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1E2035] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#E84545]" />
            Latest Vitals
          </h2>
          <div className="rounded-3xl p-6" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
            {vitals && vitals.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#EEF0F5]">
                  <p className="text-[10px] uppercase font-bold text-[#9898B8]">Blood Pressure</p>
                  <p className="text-lg font-black text-[#1E2035] mt-1">{vitals[0].bpSystolic}/{vitals[0].bpDiastolic}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#EEF0F5]">
                  <p className="text-[10px] uppercase font-bold text-[#9898B8]">Heart Rate</p>
                  <p className="text-lg font-black text-[#E84545] mt-1">{vitals[0].heartRate} <span className="text-xs font-bold text-[#9898B8]">bpm</span></p>
                </div>
                <div className="p-4 rounded-xl bg-[#EEF0F5]">
                  <p className="text-[10px] uppercase font-bold text-[#9898B8]">Temperature</p>
                  <p className="text-lg font-black text-[#F39C12] mt-1">{vitals[0].temperatureF}°F</p>
                </div>
                <div className="p-4 rounded-xl bg-[#EEF0F5]">
                  <p className="text-[10px] uppercase font-bold text-[#9898B8]">Weight</p>
                  <p className="text-lg font-black text-[#27AE60] mt-1">{vitals[0].weightKg} <span className="text-xs font-bold text-[#9898B8]">kg</span></p>
                </div>
                <p className="col-span-2 text-right text-xs text-[#9898B8] font-bold mt-2">
                  Recorded on: {new Date(vitals[0].recordedAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-center text-[#9898B8] text-sm">No vitals recorded.</p>
            )}
          </div>
        </div>

        {/* Lab Results */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-[#1E2035] flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[#27AE60]" />
            Lab Results
          </h2>
          <div className="rounded-3xl p-6" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
            <div className="space-y-4">
              {labs?.length === 0 ? (
                <p className="text-center text-[#9898B8] text-sm">No lab results available.</p>
              ) : (
                labs?.map((lab: any) => (
                  <div key={lab.id} className="flex justify-between items-center p-4 rounded-xl bg-[#EEF0F5] hover:shadow-[inset_2px_2px_5px_#C8CAD4,inset_-2px_-2px_5px_#FFFFFF] transition-all">
                    <div>
                      <h3 className="font-bold text-[#1E2035]">{lab.testName}</h3>
                      <p className="text-xs text-[#9898B8] mt-1">Ordered on: {new Date(lab.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      {lab.status === 'RESULTED' || lab.status === 'REVIEWED' ? (
                        <>
                          <p className={`text-lg font-black ${lab.isAbnormal ? 'text-[#E84545]' : 'text-[#27AE60]'}`}>
                            {lab.resultValue} <span className="text-xs text-[#5A5A7A] font-bold">{lab.unit}</span>
                          </p>
                          {(lab.referenceRangeLow !== null || lab.referenceRangeHigh !== null) && (
                            <p className="text-[10px] text-[#9898B8] font-bold mt-0.5">Ref: {lab.referenceRangeLow} - {lab.referenceRangeHigh}</p>
                          )}
                        </>
                      ) : (
                        <span className="text-xs font-bold px-3 py-1 bg-[#F39C12]/10 text-[#F39C12] rounded-full">PENDING</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
