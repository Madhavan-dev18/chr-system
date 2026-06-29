import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#EEF0F5] flex flex-col items-center justify-center p-4 font-sans text-[#2D3142]">
      <div 
        className="max-w-md w-full p-8 rounded-3xl flex flex-col items-center text-center"
        style={{
          boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF',
        }}
      >
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF',
            color: '#FF6B35'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Access Rejected</h1>
        <p className="text-gray-500 mb-8">
          You do not have the required permissions to view this page. If you believe this is an error, please contact your administrator.
        </p>

        <Link 
          href="/" 
          className="w-full py-3 px-4 rounded-xl font-medium text-white transition-all active:scale-95 block text-center"
          style={{
            backgroundColor: '#FF6B35',
            boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF',
          }}
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
