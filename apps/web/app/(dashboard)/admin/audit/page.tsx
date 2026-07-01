import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TopBar } from '@/components/layout/TopBar';
import { formatDateTime } from '@/lib/utils';
import { Shield } from 'lucide-react';

export const metadata = { title: 'Audit Logs' };

export default async function AuditLogsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/unauthorized');

  const logs = await prisma.auditLog.findMany({
    where: { clinicId: session.user.clinicId! },
    orderBy: { timestamp: 'desc' },
    take: 200,
    include: { user: { select: { email: true, role: true } } },
  });

  return (
    <>
      <TopBar title="Audit Logs" subtitle="HIPAA-compliant access history" />
      <div className="p-6">
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <Shield className="w-4 h-4 text-accent" />
            <span className="font-bold text-sm text-foreground">Showing last {logs.length} events</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr>
                <th>Time</th><th>User</th><th>Role</th><th>Action</th>
                <th>Resource</th><th>IP</th>
              </tr></thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id}>
                    <td className="font-mono text-xs whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                    <td className="text-xs">{log.user?.email ?? 'System'}</td>
                    <td className="text-xs text-muted">{log.user?.role ?? '—'}</td>
                    <td>
                      <span className={`badge badge-sm ${
                        log.action === 'DELETE' ? 'badge-red' :
                        log.action === 'CREATE' ? 'badge-green' :
                        log.action === 'LOGIN_FAIL' ? 'badge-yellow' :
                        log.action === 'AI_QUERY' ? 'badge-purple' : 'badge-blue'
                      }`}>{log.action}</span>
                    </td>
                    <td className="text-xs font-mono text-muted">{log.resource}</td>
                    <td className="font-mono text-xs text-muted">{log.ipAddress ?? '—'}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted py-10">No audit events found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
