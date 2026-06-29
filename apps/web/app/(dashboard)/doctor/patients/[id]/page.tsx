import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function PatientChartPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (session?.user?.role !== 'DOCTOR') {
    redirect('/unauthorized');
  }

  // NOTE: In a real implementation, we would query the patient and their decrypted records via tRPC.
  const resolvedParams = await params;
  const mrn = resolvedParams.id; // For demo purposes, we're passing MRN in the URL

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <Link href="/doctor/patients" className="text-[#4A90D9] text-sm font-semibold hover:underline mb-2 inline-block">
            &larr; Back to Roster
          </Link>
          <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">John Doe</h1>
          <p className="text-[#9898B8] mt-1 text-sm font-medium font-mono">{mrn} • 46 yo Male • Blood Type O+</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Clinical Encounter (SOAP Note) */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            className="rounded-3xl p-6"
            style={{
              background: '#F2F4FA',
              boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF',
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#1E2035]">New Clinical Note</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4A90D9]/10 text-[#4A90D9]">
                SOAP Note
              </span>
            </div>

            <textarea 
              className="w-full h-64 p-4 text-sm text-[#1E2035] rounded-xl outline-none resize-none mb-6"
              placeholder="Enter patient symptoms, history of present illness, and observations..."
              defaultValue="Patient presents with severe left arm pain and shortness of breath that began 30 minutes ago. Diaphoretic. History of hypertension."
              style={{
                background: '#EEF0F5',
                boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF',
              }}
            />

            <div className="flex justify-between items-center">
              <button 
                className="px-6 py-3 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                style={{
                  background: '#8E44AD', // Purple for AI
                  boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09l2.846.813-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.428-1.428L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.428-1.428l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.428 1.428l1.183.394-1.183.394a2.25 2.25 0 0 0-1.428 1.428Z" />
                </svg>
                Analyze with Gemini AI
              </button>
              
              <button 
                className="px-6 py-3 text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 active:scale-95"
                style={{
                  background: '#FF6B35',
                  boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF',
                }}
              >
                Secure Save & Encrypt
              </button>
            </div>
          </div>

          {/* AI Differential Output Placeholder */}
          <div 
            className="rounded-3xl p-6 border-l-4 border-[#8E44AD]"
            style={{
              background: '#F2F4FA',
              boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF',
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#1E2035]">AI Differential Diagnosis</h3>
              <span className="text-xs font-semibold text-[#8890B8]">Powered by Gemini 1.5 Flash</span>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#EEF0F5] shadow-inner border border-[#E84545]/20">
                <div className="flex justify-between">
                  <span className="font-bold text-[#E84545]">Myocardial Infarction (ICD10: I21.9)</span>
                  <span className="font-mono text-sm font-bold text-[#1E2035]">92%</span>
                </div>
                <p className="text-sm text-[#5A5A7A] mt-2">Patient age, left arm pain, shortness of breath, and diaphoresis strongly suggest acute coronary syndrome.</p>
                <div className="mt-3 text-xs font-semibold text-[#1E2035]">
                  Next Steps: ECG, Troponin, Aspirin
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[#9898B8] mt-4 uppercase tracking-wide">
              This is an AI-generated differential diagnosis and is for informational purposes only. It is not a substitute for professional medical judgment.
            </p>
          </div>
        </div>

        {/* Right Column: History & Vitals Timeline */}
        <div className="space-y-6">
          <div 
            className="rounded-3xl p-6"
            style={{
              background: '#F2F4FA',
              boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF',
            }}
          >
            <h2 className="text-xl font-bold text-[#1E2035] mb-6">Chart History</h2>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#C8CAD4] before:to-transparent">
              {/* Timeline Item */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-[#FF6B35] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl shadow-[inset_2px_2px_5px_#C8CAD4,inset_-2px_-2px_5px_#FFFFFF] bg-[#EEF0F5]">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-[#1E2035] text-sm">Vitals Logged</div>
                    <time className="font-mono text-xs text-[#4A90D9]">10:00 AM</time>
                  </div>
                  <div className="text-xs text-[#5A5A7A]">BP 140/90, HR 82, SpO2 98%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
