'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';

export default function DoctorPatientsDashboard() {
  const [search, setSearch] = useState('');
  const { data: patients, isLoading } = trpc.patients.list.useQuery({ search });

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">My Patients</h1>
          <p className="text-[#9898B8] mt-1 text-sm font-medium">View and manage patients assigned to your care</p>
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
          <h2 className="text-xl font-bold text-[#1E2035]">Assigned Roster</h2>
          <input 
            type="text" 
            placeholder="Search MRN or Name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            <div>DOB</div>
            <div>Blood Type</div>
            <div>Actions</div>
          </div>
          
          {isLoading ? (
            <div className="px-4 py-8 text-center text-[#9898B8]">Loading patients...</div>
          ) : patients?.length === 0 ? (
            <div className="px-4 py-8 text-center text-[#9898B8]">No patients found.</div>
          ) : (
            patients?.map((patient) => (
              <div key={patient.id} className="grid grid-cols-5 gap-4 px-4 py-4 items-center transition-colors hover:bg-[#EEF0F5]/50 rounded-xl mt-2 cursor-pointer">
                <div className="font-mono text-[#4A90D9] font-medium">{patient.mrn}</div>
                <div className="font-semibold text-[#1E2035]">{patient.firstName} {patient.lastName}</div>
                <div className="font-mono text-xs text-[#9898B8]">{new Date(patient.dob).toLocaleDateString()}</div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E84545]/10 text-[#E84545]">
                    {patient.bloodType || 'Unknown'}
                  </span>
                </div>
                <div>
                  <Link href={`/doctor/patients/${patient.mrn}`} className="text-[#4A90D9] font-semibold hover:underline">
                    View Chart &rarr;
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
