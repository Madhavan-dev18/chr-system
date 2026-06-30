'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Pill, Plus, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DoctorPrescriptions() {
  const [patientId, setPatientId] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [unit, setUnit] = useState('mg');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock patient list
  const { data: patients } = trpc.patients.list.useQuery({});
  
  // List prescriptions for the selected patient
  const { data: prescriptions, refetch } = trpc.prescriptions.list.useQuery(
    { patientId },
    { enabled: !!patientId }
  );

  const createMutation = trpc.prescriptions.create.useMutation({
    onSuccess: () => {
      setMedicationName('');
      setDosage('');
      setFrequency('');
      refetch();
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  const discontinueMutation = trpc.prescriptions.discontinue.useMutation({
    onSuccess: () => refetch()
  });

  const handlePrescribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !medicationName || !dosage || !frequency) return;

    createMutation.mutate({
      patientId,
      medicationName,
      dosage,
      unit,
      frequency,
      startDate: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
    });
  };

  return (
    <div className="p-8 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Prescriptions</h1>
          <p className="text-[#9898B8] mt-1 text-sm font-medium">Prescribe medications and check interactions</p>
        </div>

        {/* Patient Selector */}
        <select 
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="w-full md:w-64 px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none font-bold"
          style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
        >
          <option value="">Select a Patient...</option>
          {patients?.map((p: any) => (
            <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>
          ))}
        </select>
      </header>

      {patientId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Prescribe Form (Left) */}
          <div className="lg:col-span-1 h-fit rounded-3xl p-6" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
            <h2 className="text-xl font-bold text-[#1E2035] mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#4A90D9]" />
              New Prescription
            </h2>
            
            <form onSubmit={handlePrescribe} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#9898B8] uppercase">Medication</label>
                <input 
                  type="text"
                  placeholder="e.g. Amoxicillin"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none"
                  style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#9898B8] uppercase">Dosage</label>
                  <input 
                    type="number"
                    placeholder="500"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none"
                    style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#9898B8] uppercase">Unit</label>
                  <select 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none"
                    style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
                  >
                    <option>mg</option>
                    <option>mcg</option>
                    <option>g</option>
                    <option>ml</option>
                    <option>tablet</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#9898B8] uppercase">Frequency</label>
                <input 
                  type="text"
                  placeholder="e.g. Twice daily (BID)"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none"
                  style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
                  required
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full py-3 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                  style={{ background: '#FF6B35', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }}
                >
                  {createMutation.isPending ? 'Checking Interactions...' : 'Prescribe'}
                </button>
              </div>

              {createMutation.isError && (
                <div className="mt-4 p-3 rounded-lg bg-[#E84545]/10 border border-[#E84545]/20 text-[#E84545] text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {createMutation.error.message}
                </div>
              )}
            </form>
          </div>

          {/* Active Medications List (Right) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl p-6" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#1E2035]">Medication History</h2>
                <div className="flex items-center gap-1 text-[#27AE60] text-xs font-bold bg-[#27AE60]/10 px-3 py-1.5 rounded-full">
                  <ShieldCheck className="w-4 h-4" />
                  Allergy Check Active
                </div>
              </div>

              <div className="space-y-4">
                {prescriptions?.length === 0 ? (
                  <div className="p-8 text-center text-[#9898B8] font-medium">
                    No prescriptions found for this patient.
                  </div>
                ) : (
                  prescriptions?.map((rx: any) => (
                    <div key={rx.id} className={`flex items-center justify-between p-4 rounded-xl transition-all ${rx.isActive ? 'bg-[#EEF0F5]' : 'bg-[#EEF0F5]/50 opacity-60'}`} style={rx.isActive ? { boxShadow: 'inset 2px 2px 5px #C8CAD4, inset -2px -2px 5px #FFFFFF' } : {}}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${rx.isActive ? 'bg-[#4A90D9]/10 text-[#4A90D9]' : 'bg-[#9898B8]/10 text-[#9898B8]'}`}>
                          <Pill className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#1E2035] text-lg">
                            {rx.medicationName} <span className="text-sm font-medium text-[#5A5A7A]">{rx.dosage}{rx.unit}</span>
                          </h3>
                          <p className="text-xs font-semibold text-[#9898B8] mt-1">Sig: {rx.frequency} • Since {new Date(rx.startDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {rx.isActive ? (
                        <button 
                          onClick={() => discontinueMutation.mutate({ id: rx.id })}
                          className="px-4 py-2 text-[#E84545] font-bold text-xs rounded-lg shadow-[4px_4px_8px_#C8CAD4,-4px_-4px_8px_#FFFFFF] bg-[#EEF0F5] hover:bg-[#E84545] hover:text-white transition-colors"
                        >
                          Discontinue
                        </button>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-[#9898B8] px-3 py-1 border border-[#C8CAD4] rounded-full">
                          Discontinued
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
        </div>
      ) : (
        <div className="rounded-3xl p-12 text-center" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
          <Pill className="w-12 h-12 text-[#9898B8] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-[#1E2035]">No Patient Selected</h3>
          <p className="text-[#9898B8] font-medium mt-2">Select a patient from the dropdown above to view or add prescriptions.</p>
        </div>
      )}
    </div>
  );
}
