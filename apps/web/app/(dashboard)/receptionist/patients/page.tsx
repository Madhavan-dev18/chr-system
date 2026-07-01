import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TopBar } from '@/components/layout/TopBar';
import { formatDate, calculateAge } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

export const metadata = { title: 'Patients — Receptionist' };

export default async function ReceptionistPatientsPage() {
  const session = await auth();
  if (!session?.user || !['RECEPTIONIST', 'ADMIN'].includes(session.user.role)) redirect('/unauthorized');

  const patients = await prisma.patient.findMany({
    where: { clinicId: session.user.clinicId!, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true, mrn: true, firstName: true, lastName: true,
      dob: true, gender: true, phone: true, createdAt: true,
      _count: { select: { appointments: { where: { status: 'PENDING' } } } },
    },
  });

  return (
    <>
      <TopBar title="All Patients" subtitle={`${patients.length} registered`} />
      <div className="p-6">
        {patients.length === 0 ? (
          <div className="card">
            <EmptyState icon={Users} title="No Patients" description="No patients registered yet." />
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr>
                  <th>MRN</th><th>Name</th><th>Age</th><th>Phone</th>
                  <th>Upcoming Appts</th><th>Registered</th>
                </tr></thead>
                <tbody>
                  {patients.map((p: any) => (
                    <tr key={p.id}>
                      <td><span className="font-mono text-xs text-accent">{p.mrn}</span></td>
                      <td className="font-semibold text-foreground">{p.firstName} {p.lastName}</td>
                      <td>{calculateAge(p.dob)}y / {p.gender}</td>
                      <td className="font-mono text-xs">{p.phone ?? '—'}</td>
                      <td>{p._count.appointments > 0 ? <span className="badge badge-blue"><span className="badge-dot" />{p._count.appointments}</span> : <span className="text-muted text-xs">None</span>}</td>
                      <td className="text-xs text-muted">{formatDate(p.createdAt)}</td>
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
