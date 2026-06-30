'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Activity, Thermometer, HeartPulse, Scale, CheckCircle } from 'lucide-react';

export default function VitalsEntry() {
  const [patientId, setPatientId] = useState('');
  
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperatureF, setTemperatureF] = useState('');
  const [spo2, setSpo2] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [notes, setNotes] = useState('');

  const { data: patients } = trpc.patients.list.useQuery({});
  const { refetch: refetchVitals } = trpc.vitals.listByPatient.useQuery({ patientId }, { enabled: !!patientId });

  const recordMutation = trpc.vitals.record.useMutation({
    onSuccess: () => {
      setBpSystolic('');
      setBpDiastolic('');
      setHeartRate('');
      setTemperatureF('');
      setSpo2('');
      setWeightKg('');
      setHeightCm('');
      setNotes('');
      alert('Vitals successfully recorded!');
      refetchVitals();
    },
    onError: (err) => alert(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;

    recordMutation.mutate({
      patientId,
      bpSystolic: bpSystolic ? parseInt(bpSystolic) : undefined,
      bpDiastolic: bpDiastolic ? parseInt(bpDiastolic) : undefined,
      heartRate: heartRate ? parseInt(heartRate) : undefined,
      temperatureF: temperatureF ? parseFloat(temperatureF) : undefined,
      spo2: spo2 ? parseFloat(spo2) : undefined,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      heightCm: heightCm ? parseFloat(heightCm) : undefined,
      notes,
    });
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Record Vitals</h1>
        <p className="text-[#9898B8] mt-1 text-sm font-medium">Select a patient and enter their current vitals</p>
      </header>

      <div className="rounded-3xl p-8" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Patient Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#9898B8] uppercase">Select Patient</label>
            <select 
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none font-bold"
              style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
              required
            >
              <option value="">Choose...</option>
              {patients?.map(p => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Blood Pressure */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#EEF0F5] shadow-[inset_2px_2px_5px_#C8CAD4,inset_-2px_-2px_5px_#FFFFFF]">
              <div className="flex items-center gap-2 mb-2 text-[#4A90D9]">
                <HeartPulse className="w-5 h-5" />
                <label className="text-xs font-bold uppercase">Blood Pressure</label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" placeholder="Sys" value={bpSystolic} onChange={(e) => setBpSystolic(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-center text-[#1E2035] rounded-lg outline-none bg-white/50"
                />
                <span className="text-[#9898B8] font-black">/</span>
                <input 
                  type="number" placeholder="Dia" value={bpDiastolic} onChange={(e) => setBpDiastolic(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-center text-[#1E2035] rounded-lg outline-none bg-white/50"
                />
              </div>
            </div>

            {/* Heart Rate */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#EEF0F5] shadow-[inset_2px_2px_5px_#C8CAD4,inset_-2px_-2px_5px_#FFFFFF]">
              <div className="flex items-center gap-2 mb-2 text-[#E84545]">
                <Activity className="w-5 h-5" />
                <label className="text-xs font-bold uppercase">Heart Rate (bpm)</label>
              </div>
              <input 
                type="number" placeholder="e.g. 72" value={heartRate} onChange={(e) => setHeartRate(e.target.value)}
                className="w-full px-3 py-2 text-sm text-[#1E2035] rounded-lg outline-none bg-white/50"
              />
            </div>

            {/* Temperature */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#EEF0F5] shadow-[inset_2px_2px_5px_#C8CAD4,inset_-2px_-2px_5px_#FFFFFF]">
              <div className="flex items-center gap-2 mb-2 text-[#F39C12]">
                <Thermometer className="w-5 h-5" />
                <label className="text-xs font-bold uppercase">Temperature (°F)</label>
              </div>
              <input 
                type="number" step="0.1" placeholder="e.g. 98.6" value={temperatureF} onChange={(e) => setTemperatureF(e.target.value)}
                className="w-full px-3 py-2 text-sm text-[#1E2035] rounded-lg outline-none bg-white/50"
              />
            </div>

            {/* SpO2 */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#EEF0F5] shadow-[inset_2px_2px_5px_#C8CAD4,inset_-2px_-2px_5px_#FFFFFF]">
              <div className="flex items-center gap-2 mb-2 text-[#9B59B6]">
                <Activity className="w-5 h-5" />
                <label className="text-xs font-bold uppercase">SpO2 (%)</label>
              </div>
              <input 
                type="number" placeholder="e.g. 98" value={spo2} onChange={(e) => setSpo2(e.target.value)}
                className="w-full px-3 py-2 text-sm text-[#1E2035] rounded-lg outline-none bg-white/50"
              />
            </div>

            {/* Weight / Height */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-2 p-4 rounded-2xl bg-[#EEF0F5] shadow-[inset_2px_2px_5px_#C8CAD4,inset_-2px_-2px_5px_#FFFFFF]">
              <div className="flex items-center gap-2 mb-2 text-[#27AE60]">
                <Scale className="w-5 h-5" />
                <label className="text-xs font-bold uppercase">Body Metrics</label>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-2">
                  <input 
                    type="number" step="0.1" placeholder="Weight" value={weightKg} onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-[#1E2035] rounded-lg outline-none bg-white/50"
                  />
                  <span className="text-xs font-bold text-[#9898B8]">kg</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <input 
                    type="number" step="0.1" placeholder="Height" value={heightCm} onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-[#1E2035] rounded-lg outline-none bg-white/50"
                  />
                  <span className="text-xs font-bold text-[#9898B8]">cm</span>
                </div>
              </div>
            </div>

          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#9898B8] uppercase">Clinical Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional observations..."
              className="w-full px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none resize-none"
              style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
            />
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={recordMutation.isPending || !patientId}
              className="px-8 py-4 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 flex items-center gap-2"
              style={{ background: '#4A90D9', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }}
            >
              <CheckCircle className="w-5 h-5" />
              {recordMutation.isPending ? 'Saving...' : 'Save Vitals'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
