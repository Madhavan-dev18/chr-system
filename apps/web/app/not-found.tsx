export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#EEF0F5] p-4 text-center font-sans">
      <h1 className="text-6xl font-bold text-[#FF6B35]">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">Page Not Found</h2>
      <p className="mt-2 text-gray-600">The clinical record or resource you requested could not be found.</p>
    </div>
  );
}
