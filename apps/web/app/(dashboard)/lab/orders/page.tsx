import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TopBar } from '@/components/layout/TopBar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/utils';
import { FlaskConical } from 'lucide-react';

export const metadata = { title: 'Lab Orders' };

export default async function LabOrdersPage() {
  const session = await auth();
  if (!session?.user || !['LAB_TECH', 'ADMIN', 'DOCTOR'].includes(session.user.role)) redirect('/unauthorized');

  const orders = await prisma.labResult.findMany({
    where: { clinicId: session.user.clinicId!, status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    take: 100,
    include: {
      patient: { select: { firstName: true, lastName: true, mrn: true } },
      orderedBy: { select: { email: true } },
    },
  });

  return (
    <>
      <TopBar title="Lab Orders Queue" subtitle={`${orders.length} pending`} />
      <div className="p-6">
        {orders.length === 0 ? (
          <div className="card">
            <EmptyState icon={FlaskConical} title="Queue Clear" description="No pending lab orders." />
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr>
                  <th>Patient</th><th>Test</th>
                  <th>Ordered By</th><th>Ordered At</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {orders.map((o: any) => (
                    <tr key={o.id}>
                      <td>
                        <p className="font-semibold text-foreground text-sm">{o.patient.firstName} {o.patient.lastName}</p>
                        <p className="font-mono text-xs text-accent">{o.patient.mrn}</p>
                      </td>
                      <td>
                        <p className="text-sm">{o.testName}</p>
                      </td>
                      <td className="text-xs text-muted">{o.orderedBy.email}</td>
                      <td className="text-xs text-muted whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                      <td><Badge label={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
