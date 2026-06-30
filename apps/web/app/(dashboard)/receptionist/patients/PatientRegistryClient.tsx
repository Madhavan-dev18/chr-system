'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { RegisterPatientForm } from '@/components/forms/RegisterPatientForm';

export function PatientRegistryClient() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: patients, isLoading, refetch } = trpc.patients.list.useQuery();

  const filteredPatients = patients?.filter(p => 
    p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) || 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Patient Registry</h1>
          <p className="text-[#9898B8] mt-1 text-sm font-medium">Manage clinic patients and registration</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2.5 rounded-xl font-semibold text-white bg-[#FF6B35] transition-all" 
          style={{ boxShadow: '0 4px 14px rgba(255,107,53,0.35)' }}
        >
          {showForm ? 'Close Form' : '+ Register Patient'}
        </button>
      </header>

      {showForm && (
        <div className="mb-8">
          <RegisterPatientForm 
            onSuccess={() => { setShowForm(false); refetch(); }} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
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
          <h2 className="text-xl font-bold text-[#1E2035]">All Patients</h2>
          <input 
            type="text" 
            placeholder="Search MRN, Name, or Phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          
          {isLoading ? (
            <div className="px-4 py-8 text-center text-[#9898B8]">Loading patients...</div>
          ) : filteredPatients?.length === 0 ? (
            <div className="px-4 py-8 text-center text-[#9898B8]">No patients found.</div>
          ) : (
            filteredPatients?.map(patient => (
              <div key={patient.id} className="grid grid-cols-5 gap-4 px-4 py-4 items-center transition-colors hover:bg-[#EEF0F5]/50 rounded-xl mt-2 cursor-pointer">
                <div className="font-mono text-[#4A90D9] font-medium">{patient.mrn}</div>
                <div className="font-semibold text-[#1E2035]">{patient.firstName} {patient.lastName}</div>
                <div className="text-xs text-[#5A5A7A]">{patient.phone || patient.email || 'No contact'}</div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#27AE60]/10 text-[#27AE60]">
                    Active
                  </span>
                </div>
                <div>
                  <Link href={`/receptionist/patients/${patient.id}`} className="text-[#FF6B35] font-semibold hover:underline">
                    Edit Profile &rarr;
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
