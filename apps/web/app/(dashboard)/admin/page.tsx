import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TopBar } from '@/components/layout/TopBar';
import { StatCard } from '@/components/ui/StatCard';
import { Users, Calendar, UserCog, FlaskConical, Activity, ClipboardList } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/unauthorized');

  const clinicId = session.user.clinicId!;

  const [patients, appointments, users, pendingLabs, recentAuditLogs] = await Promise.all([
    prisma.patient.count({ where: { clinicId, deletedAt: null } }),
    prisma.appointment.count({ where: { clinicId, status: { in: ['PENDING', 'CONFIRMED'] } } }),
    prisma.user.count({ where: { clinicId, deletedAt: null } }),
    prisma.labResult.count({ where: { clinicId, status: 'PENDING' } }),
    prisma.auditLog.findMany({
      where: { clinicId },
      orderBy: { timestamp: 'desc' },
      take: 8,
      include: { user: { select: { email: true, role: true } } },
    }),
  ]);

  return (
    <>
      <TopBar title="Admin Dashboard" subtitle="Clinic-wide overview" />
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Patients" value={patients} icon={Users} color="blue" />
          <StatCard label="Upcoming Appointments" value={appointments} icon={Calendar} color="green" />
          <StatCard label="Staff Users" value={users} icon={UserCog} color="purple" />
          <StatCard label="Pending Lab Orders" value={pendingLabs} icon={FlaskConical} color={pendingLabs > 0 ? 'yellow' : undefined} />
        </div>

        {/* Recent Audit Logs */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-accent" />
            <h2 className="font-bold text-foreground">Recent Audit Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th><th>Role</th><th>Action</th><th>Resource</th><th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentAuditLogs.map((log: any) => (
                  <tr key={log.id}>
                    <td className="font-mono text-xs">{log.user?.email ?? 'System'}</td>
                    <td>{log.user?.role ?? '—'}</td>
                    <td><span className="font-semibold text-foreground">{log.action}</span></td>
                    <td className="text-xs text-muted">{log.resource}</td>
                    <td className="text-xs text-muted whitespace-nowrap">{formatDate(log.timestamp)}</td>
                  </tr>
                ))}
                {recentAuditLogs.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-muted py-8">No recent activity</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
