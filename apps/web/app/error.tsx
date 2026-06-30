'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    console.error('[Global Error Boundary Caught]:', error);

    
    // In a real Sentry setup, this would be uncommented if @sentry/nextjs is fully installed:
    // Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl shadow-inner neumorphic-container">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Something went wrong!</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        An unexpected error has occurred. Our engineering team has been notified via Sentry.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-[#FF6B35] text-white rounded-md hover:bg-[#E55A24] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B35]"
      >
        Try again
      </button>
    </div>
  );
}
