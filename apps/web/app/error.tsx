'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold mb-4 font-sans text-foreground">Something went wrong!</h2>
      <p className="text-muted font-mono text-sm mb-6">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={() => reset()}
        className="neu-btn neu-btn-primary"
      >
        Try again
      </button>
    </div>
  );
}
