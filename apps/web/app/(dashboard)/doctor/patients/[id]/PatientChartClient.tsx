'use client';

import { trpc } from '@/lib/trpc/client';
import { VitalsChart } from '@/components/charts/VitalsChart';
import Link from 'next/link';
import { useState } from 'react';

export function PatientChartClient({ mrn }: { mrn: string }) {
  const [clinicalNote, setClinicalNote] = useState('');

  // First get the patient ID by MRN
  const { data: patients, isLoading: patientLoading } = trpc.patients.list.useQuery({ search: mrn });
  const patient = patients?.[0];

  // Then fetch vitals
  const { data: vitals } = trpc.vitals.listByPatient.useQuery(
    { patientId: patient?.id as string },
    { enabled: !!patient?.id }
  );

  if (patientLoading) {
    return <div className="text-center py-12 text-[#9898B8] font-bold animate-pulse">Loading Patient Data...</div>;
  }

  if (!patient) {
    return <div className="text-center py-12 text-[#E84545] font-bold">Patient Not Found</div>;
  }

  const age = Math.floor((Date.now() - new Date(patient.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <Link href="/doctor/patients" className="text-[#4A90D9] text-sm font-semibold hover:underline mb-2 inline-block">
            &larr; Back to Roster
          </Link>
          <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">{patient.firstName} {patient.lastName}</h1>
          <p className="text-[#9898B8] mt-1 text-sm font-medium font-mono">{mrn} • {age} yo {patient.gender} • Blood Type {patient.bloodType || 'Unknown'}</p>
          {patient.allergies.length > 0 && (
            <p className="text-[#E84545] text-xs font-bold mt-2 flex items-center gap-1">
              <span className="uppercase tracking-wider">Allergies:</span> {patient.allergies.join(', ')}
            </p>
          )}
        </div>
      </header>

      {/* Vitals Flowsheet */}
      <div 
        className="rounded-3xl p-6"
        style={{
          background: '#F2F4FA',
          boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF',
        }}
      >
        <h2 className="text-xl font-bold text-[#1E2035] mb-6">Vitals Flowsheet</h2>
        
        {vitals ? (
          <VitalsChart data={vitals} />
        ) : (
          <div className="h-64 flex items-center justify-center rounded-3xl" style={{ background: '#EEF0F5', boxShadow: 'inset 6px 6px 12px #C8CAD4, inset -6px -6px 12px #FFFFFF' }}>
            <p className="text-[#9898B8] font-medium animate-pulse">Loading vitals...</p>
          </div>
        )}
      </div>
    </div>
  );
}
