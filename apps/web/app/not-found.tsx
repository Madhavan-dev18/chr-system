export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4 font-sans text-foreground">404 - Not Found</h2>
      <p className="text-muted font-mono text-sm">The requested resource could not be found.</p>
    </div>
  );
}
