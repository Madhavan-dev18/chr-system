'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { FlaskConical, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DoctorLabReview() {
  const [patientId, setPatientId] = useState('');
  const [testName, setTestName] = useState('');

  const { data: patientsData } = trpc.patients.list.useQuery({});
  const patients = patientsData?.patients ?? [];
  
  const { data: labsData, refetch } = trpc.labs.listOrders.useQuery(
    { patientId: patientId || undefined },
    { enabled: true }
  );
  const labs = labsData?.orders ?? [];

  const orderMutation = trpc.labs.createOrder.useMutation({
    onSuccess: () => {
      setPatientId('');
      setTestName('');
      refetch();
    },
    onError: (err) => alert(err.message),
  });

  const handleOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!patientId || !testName) return;

    orderMutation.mutate({
      patientId,
      testName,
    });
  };

  return (
    <div className="p-8 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Lab Results & Orders</h1>
          <p className="text-[#9898B8] mt-1 text-sm font-medium">Review patient results and order new tests</p>
        </div>

        <select 
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="w-full md:w-64 px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none font-bold"
          style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
        >
          <option value="">All Patients</option>
          {patients?.map((p: any) => (
            <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>
          ))}
        </select>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Order Form */}
        <div className="xl:col-span-1 h-fit rounded-3xl p-6" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
          <h2 className="text-xl font-bold text-[#1E2035] mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#4A90D9]" />
            Order Lab Test
          </h2>

          <form onSubmit={handleOrder} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#9898B8] uppercase">Test Name</label>
              <input 
                type="text"
                placeholder="e.g. Complete Blood Count"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full px-4 py-3 text-sm text-[#1E2035] rounded-xl outline-none"
                style={{ background: '#EEF0F5', boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF' }}
                required
                disabled={!patientId}
              />
            </div>


            <div className="pt-4">
              <button 
                type="submit"
                disabled={orderMutation.isPending || !patientId}
                className="w-full py-3 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                style={{ background: '#4A90D9', boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF' }}
              >
                {orderMutation.isPending ? 'Ordering...' : 'Order Test'}
              </button>
              {!patientId && (
                <p className="text-center text-xs text-[#E84545] font-semibold mt-3">Please select a patient first.</p>
              )}
            </div>
          </form>
        </div>

        {/* Results List */}
        <div className="xl:col-span-2 space-y-4">
          {labs?.length === 0 ? (
            <div className="rounded-3xl p-12 text-center" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
              <FlaskConical className="w-12 h-12 text-[#9898B8] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-[#1E2035]">No Lab Records</h3>
              <p className="text-[#9898B8] font-medium mt-2">No labs found for the selected patient.</p>
            </div>
          ) : (
            labs?.map((lab: any) => (
              <div 
                key={lab.id} 
                className={`rounded-3xl p-6 transition-all ${lab.isAbnormal ? 'border-2 border-[#E84545]' : ''}`} 
                style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-[#1E2035]">{lab.testName}</h3>
                    <p className="text-sm font-semibold text-[#5A5A7A] mt-1">Patient: {lab.patient.firstName} {lab.patient.lastName} ({lab.patient.mrn})</p>
                    <p className="text-xs text-[#9898B8] mt-1">Ordered: {new Date(lab.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    {lab.status === 'RESULTED' ? (
                      <>
                        <div className="flex items-center justify-end gap-2 mb-1">
                          {lab.isAbnormal && <AlertTriangle className="w-4 h-4 text-[#E84545]" />}
                          <span className={`text-2xl font-black ${lab.isAbnormal ? 'text-[#E84545]' : 'text-[#27AE60]'}`}>
                            {lab.resultValue} <span className="text-sm font-bold text-[#5A5A7A]">{lab.unit}</span>
                          </span>
                        </div>
                        {(lab.referenceRangeLow !== null || lab.referenceRangeHigh !== null) && (
                          <p className="text-xs text-[#9898B8] font-bold">Ref: {lab.referenceRangeLow} - {lab.referenceRangeHigh}</p>
                        )}
                        <p className="text-xs text-[#4A90D9] font-bold mt-2 flex items-center justify-end gap-1">
                          <CheckCircle className="w-3 h-3" /> Reviewed
                        </p>
                      </>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#F39C12]/10 text-[#F39C12]">
                        PENDING
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
