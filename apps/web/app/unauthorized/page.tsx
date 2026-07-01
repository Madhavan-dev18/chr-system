import Link from 'next/link';
import { ShieldOff } from 'lucide-react';

export const metadata = { title: 'Unauthorized' };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-muted flex items-center justify-center mx-auto mb-4">
          <ShieldOff className="w-8 h-8 text-red" />
        </div>
        <h1 className="page-title text-xl mb-2">Access Denied</h1>
        <p className="text-muted text-sm mb-6">
          You do not have permission to access this page. If you believe this is an error, contact your administrator.
        </p>
        <Link href="/" className="btn btn-primary">Return to Dashboard</Link>
      </div>
    </div>
  );
}
