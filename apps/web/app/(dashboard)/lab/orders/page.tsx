'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { FlaskConical, CheckCircle, Clock } from 'lucide-react';

export default function LabOrders() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [unit, setUnit] = useState('');
  const [referenceRange, setReferenceRange] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);

  const { data: labs, refetch } = trpc.labs.list.useQuery({});

  const enterResultMutation = trpc.labs.enterResults.useMutation({
    onSuccess: () => {
      setSelectedOrderId('');
      setResultValue('');
      setUnit('');
      setReferenceRange('');
      setIsAbnormal(false);
      refetch();
    },
    onError: (err) => alert(err.message),
  });

  const handleComplete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOrderId || !resultValue) return;

    let referenceRangeLow: number | undefined;
    let referenceRangeHigh: number | undefined;
    if (referenceRange) {
      const parts = referenceRange.split('-');
      if (parts.length === 2) {
        referenceRangeLow = parseFloat(parts[0].trim());
        referenceRangeHigh = parseFloat(parts[1].trim());
      } else {
        referenceRangeLow = parseFloat(referenceRange.trim());
      }
    }

    enterResultMutation.mutate({
      id: selectedOrderId,
      resultValue,
      unit,
      referenceRangeLow: Number.isNaN(referenceRangeLow) ? undefined : referenceRangeLow,
      referenceRangeHigh: Number.isNaN(referenceRangeHigh) ? undefined : referenceRangeHigh,
      isAbnormal,
    });
  };

  const pendingLabs = labs?.filter((l: any) => l.status === 'PENDING') || [];
  const completedLabs = labs?.filter((l: any) => l.status === 'RESULTED' || l.status === 'REVIEWED') || [];

  return (
    <div className="p-8 space-y-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Lab Orders</h1>
        <p className="text-[#9898B8] mt-1 text-sm font-medium">Process pending test orders and enter results</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pending Orders Queue */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#1E2035] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#F39C12]" />
            Pending Orders ({pendingLabs.length})
          </h2>
          
          <div className="space-y-4">
            {pendingLabs.length === 0 ? (
              <div className="rounded-3xl p-8 text-center text-[#9898B8] font-medium" style={{ background: '#F2F4FA', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}>
                No pending orders right now.
              </div>
            ) : (
              pendingLabs.map((lab: any) => (
                <div 
                  key={lab.id} 
                  className={`rounded-3xl p-6 cursor-pointer transition-all hover:scale-[1.02] ${selectedOrderId === lab.id ? 'border-2 border-[#4A90D9]' : ''}`} 
                  style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}
                  onClick={() => setSelectedOrderId(lab.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-[#1E2035]">{lab.testName}</h3>
                      <p className="text-sm font-semibold text-[#5A5A7A] mt-1">Patient: {lab.patient.firstName} {lab.patient.lastName} ({lab.patient.mrn})</p>
                      <p className="text-xs text-[#9898B8] mt-1">Ordered by: {lab.orderedBy.email}</p>
                    </div>
                    <FlaskConical className="w-6 h-6 text-[#4A90D9]" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enter Results Form */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#1E2035] flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#27AE60]" />
            Enter Results
          </h2>

          {selectedOrderId ? (
            <div className="rounded-3xl p-6" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
              <form onSubmit={handleComplete} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#9898B8] uppercase">Result Value</label>
                  <input 
                    type="text"
                    value={resultValue}
                    onChange={(e) => setResultValue(e.target.value)}
                    className="w-full px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none"
                    style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#9898B8] uppercase">Unit</label>
                    <input 
                      type="text"
                      placeholder="e.g. mg/dL"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none"
                      style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#9898B8] uppercase">Reference Range</label>
                    <input 
                      type="text"
                      placeholder="e.g. 70-99"
                      value={referenceRange}
                      onChange={(e) => setReferenceRange(e.target.value)}
                      className="w-full px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none"
                      style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 pb-2">
                  <input 
                    type="checkbox"
                    id="abnormal"
                    checked={isAbnormal}
                    onChange={(e) => setIsAbnormal(e.target.checked)}
                    className="w-5 h-5 accent-[#E84545] rounded outline-none"
                  />
                  <label htmlFor="abnormal" className="text-sm font-bold text-[#E84545]">
                    Flag as Abnormal
                  </label>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setSelectedOrderId(null)}
                    className="flex-1 py-3 text-[#5A5A7A] font-semibold text-sm rounded-xl transition-all active:scale-95 bg-[#EEF0F5] shadow-[4px_4px_8px_#C8CAD4,-4px_-4px_8px_#FFFFFF] hover:bg-[#C8CAD4]/30"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={enterResultMutation.isPending}
                    className="flex-1 py-3 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                    style={{ background: '#27AE60', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }}
                  >
                    {enterResultMutation.isPending ? 'Saving...' : 'Submit Result'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-3xl p-12 text-center" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
              <FlaskConical className="w-12 h-12 text-[#9898B8] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-[#1E2035]">Select an Order</h3>
              <p className="text-[#9898B8] font-medium mt-2">Click on a pending order from the list to enter its results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
