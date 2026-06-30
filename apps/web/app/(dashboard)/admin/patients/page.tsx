'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';

export default function AdminPatientsDashboard() {
  const [search, setSearch] = useState('');
  const { data: patients, isLoading } = trpc.patients.list.useQuery({ search });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Patient Directory</h1>
          <p className="text-[#9898B8] mt-1 text-sm font-medium">Manage and assign clinic patients</p>
        </div>
        <button 
          className="px-6 py-3 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 opacity-50 cursor-not-allowed"
          style={{
            background: '#FF6B35',
            boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF',
          }}
          disabled
        >
          + Register New Patient (Coming Soon)
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
          <h2 className="text-xl font-bold text-[#1E2035]">All Clinic Patients</h2>
          <input 
            type="text" 
            placeholder="Search MRN or Name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-4 py-2 text-sm text-[#5A5A7A] rounded-xl outline-none font-bold"
            style={{
              background: '#EEF0F5',
              boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF',
            }}
          />
        </div>

        <div className="w-full text-left text-sm text-[#5A5A7A]">
          <div className="grid grid-cols-5 gap-4 px-4 py-3 font-bold text-[#9898B8] border-b border-[#C8CAD4]/30 uppercase text-xs tracking-wider">
            <div>MRN</div>
            <div>Name</div>
            <div>DOB</div>
            <div>Contact</div>
            <div>Actions</div>
          </div>
          
          {isLoading ? (
            <div className="px-4 py-8 text-center text-[#9898B8] font-bold animate-pulse">Loading directory...</div>
          ) : patients?.length === 0 ? (
            <div className="px-4 py-8 text-center text-[#9898B8] font-bold">No patients found.</div>
          ) : (
            patients?.map((patient: any) => (
              <div key={patient.id} className="grid grid-cols-5 gap-4 px-4 py-4 items-center transition-colors hover:bg-[#EEF0F5]/50 rounded-xl mt-2">
                <div className="font-mono text-[#4A90D9] font-bold">{patient.mrn}</div>
                <div className="font-bold text-[#1E2035]">{patient.firstName} {patient.lastName}</div>
                <div className="font-mono text-xs text-[#9898B8]">{new Date(patient.dob).toLocaleDateString()}</div>
                <div className="text-xs text-[#5A5A7A] truncate pr-4">{patient.email || patient.phone || 'N/A'}</div>
                <div>
                  <button className="text-[#9898B8] font-bold hover:text-[#4A90D9] hover:underline text-xs uppercase transition-colors">
                    Edit Profile
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
