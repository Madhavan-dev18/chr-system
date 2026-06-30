'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { z } from 'zod';

const RecordVitalsSchema = z.object({
  bpSystolic: z.number().min(0).max(300).optional(),
  bpDiastolic: z.number().min(0).max(200).optional(),
  heartRate: z.number().min(0).max(300).optional(),
  spo2: z.number().min(0).max(100).optional(),
  temperatureF: z.number().min(70).max(110).optional(),
  respiratoryRate: z.number().min(0).max(60).optional(),
  weightKg: z.number().min(0).max(500).optional(),
  heightCm: z.number().min(0).max(300).optional(),
  notes: z.string().max(5000).optional(),
});

export function RecordVitalsForm({ patientId, onSuccess, onCancel }: { patientId: string, onSuccess: () => void, onCancel: () => void }) {
  const [error, setError] = useState('');
  
  const recordVitals = trpc.vitals.record.useMutation({
    onSuccess: () => onSuccess(),
    onError: (err) => setError(err.message)
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = {};
    
    // Convert string inputs to numbers if they exist
    for (const [key, value] of formData.entries()) {
      if (value && typeof value === 'string') {
        if (key === 'notes') {
          data[key] = value;
        } else {
          data[key] = parseFloat(value);
        }
      }
    }

    if (Object.keys(data).length === 0) {
      setError('Please record at least one vital sign');
      return;
    }

    try {
      const parsed = RecordVitalsSchema.parse(data);
      recordVitals.mutate({ patientId, ...parsed });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <div 
      className="p-6 rounded-3xl mb-6"
      style={{
        background: '#EEF0F5',
        boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF',
      }}
    >
      <h3 className="text-xl font-bold text-[#1E2035] mb-6">Record New Vitals</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A5A7A] uppercase mb-1">BP Systolic</label>
            <div className="relative">
              <input name="bpSystolic" type="number" step="1" className="w-full px-4 py-2 rounded-xl outline-none" style={{ background: '#F2F4FA', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }} />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-mono">mmHg</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5A5A7A] uppercase mb-1">BP Diastolic</label>
            <div className="relative">
              <input name="bpDiastolic" type="number" step="1" className="w-full px-4 py-2 rounded-xl outline-none" style={{ background: '#F2F4FA', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }} />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-mono">mmHg</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5A5A7A] uppercase mb-1">Heart Rate</label>
            <div className="relative">
              <input name="heartRate" type="number" step="1" className="w-full px-4 py-2 rounded-xl outline-none" style={{ background: '#F2F4FA', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }} />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-mono">bpm</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A5A7A] uppercase mb-1">SpO2</label>
            <div className="relative">
              <input name="spo2" type="number" step="1" className="w-full px-4 py-2 rounded-xl outline-none" style={{ background: '#F2F4FA', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }} />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-mono">%</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5A5A7A] uppercase mb-1">Temperature</label>
            <div className="relative">
              <input name="temperatureF" type="number" step="0.1" className="w-full px-4 py-2 rounded-xl outline-none" style={{ background: '#F2F4FA', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }} />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-mono">°F</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#5A5A7A] uppercase mb-1">Weight</label>
            <div className="relative">
              <input name="weightKg" type="number" step="0.1" className="w-full px-4 py-2 rounded-xl outline-none" style={{ background: '#F2F4FA', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }} />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-mono">kg</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#5A5A7A] uppercase mb-1">Notes</label>
          <textarea name="notes" rows={2} className="w-full px-4 py-2 rounded-xl outline-none" style={{ background: '#F2F4FA', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }} />
        </div>

        {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#C8CAD4]/30">
          <button type="button" onClick={onCancel} className="px-5 py-2 rounded-xl text-[#5A5A7A] font-semibold hover:bg-[#C8CAD4]/20 transition-all">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={recordVitals.isPending}
            className="px-6 py-2 rounded-xl text-white font-semibold bg-[#4A90D9] transition-all disabled:opacity-50"
            style={{ boxShadow: '0 4px 14px rgba(74,144,217,0.35)' }}
          >
            {recordVitals.isPending ? 'Saving...' : 'Save Vitals'}
          </button>
        </div>
      </form>
    </div>
  );
}
