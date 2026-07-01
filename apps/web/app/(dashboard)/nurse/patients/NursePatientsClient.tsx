'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { RecordVitalsForm } from '@/components/forms/RecordVitalsForm';

export function NursePatientsClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recordingVitalsFor, setRecordingVitalsFor] = useState<string | null>(null);

  const { data: patientsData, isLoading, refetch } = trpc.patients.list.useQuery();
  const patients = patientsData?.patients ?? [];

  const filteredPatients = patients?.filter((p: any) => 
    p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) || 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Assigned Patients</h1>
          <p className="text-[#9898B8] mt-1 text-sm font-medium">View patients and record vitals</p>
        </div>
      </header>

      {recordingVitalsFor && (
        <RecordVitalsForm 
          patientId={recordingVitalsFor}
          onSuccess={() => { setRecordingVitalsFor(null); refetch(); }}
          onCancel={() => setRecordingVitalsFor(null)}
        />
      )}

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          
          {isLoading ? (
            <div className="px-4 py-8 text-center text-[#9898B8]">Loading patients...</div>
          ) : filteredPatients?.length === 0 ? (
            <div className="px-4 py-8 text-center text-[#9898B8]">No patients found.</div>
          ) : (
            filteredPatients?.map((patient: any) => {
              const latestVitals = patient.vitals[0];
              return (
                <div key={patient.id} className="grid grid-cols-5 gap-4 px-4 py-4 items-center transition-colors hover:bg-[#EEF0F5]/50 rounded-xl mt-2 cursor-pointer">
                  <div className="font-mono text-[#4A90D9] font-medium">{patient.mrn}</div>
                  <div className="font-semibold text-[#1E2035]">{patient.firstName} {patient.lastName}</div>
                  <div className="font-mono text-xs">
                    {latestVitals ? (
                      <>
                        <span className="text-[#E84545] font-semibold">{latestVitals.bpSystolic || '--'}/{latestVitals.bpDiastolic || '--'}</span> mmHg<br/>
                        <span className="text-[#27AE60] font-semibold">{latestVitals.spo2 || '--'}</span>% SpO2
                      </>
                    ) : (
                      <span className="text-[#9898B8]">No records</span>
                    )}
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4A90D9]/10 text-[#4A90D9]">
                      {patient.assignedDoctor?.email?.split('@')[0] || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setRecordingVitalsFor(patient.id)}
                      className="text-[#FF6B35] font-semibold hover:underline"
                    >
                      Record Vitals
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
