import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TopBar } from '@/components/layout/TopBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, calculateAge } from '@/lib/utils';
import Link from 'next/link';
import { Users } from 'lucide-react';

export const metadata = { title: 'Patients — Nurse' };

export default async function NursePatientsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'NURSE') redirect('/unauthorized');

  const patients = await prisma.patient.findMany({
    where: { clinicId: session.user.clinicId!, assignedNurseId: session.user.id, deletedAt: null },
    orderBy: { firstName: 'asc' },
    take: 100,
    include: {
      vitals: { orderBy: { recordedAt: 'desc' }, take: 1, select: { recordedAt: true, heartRate: true, spo2: true } },
    },
  });

  return (
    <>
      <TopBar title="My Patients" subtitle={`${patients.length} assigned`} />
      <div className="p-6">
        {patients.length === 0 ? (
          <div className="card">
            <EmptyState icon={Users} title="No Patients Assigned" description="Contact your admin to get patients assigned to you." />
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>MRN</th><th>Name</th><th>Age</th><th>Last Vitals</th><th>Actions</th></tr></thead>
                <tbody>
                  {patients.map((p: any) => (
                    <tr key={p.id}>
                      <td><span className="font-mono text-xs text-accent">{p.mrn}</span></td>
                      <td className="font-semibold text-foreground">{p.firstName} {p.lastName}</td>
                      <td>{calculateAge(p.dob)}y</td>
                      <td className="text-xs text-muted">
                        {p.vitals[0] ? formatDate(p.vitals[0].recordedAt) : 'Never'}
                      </td>
                      <td>
                        <Link href={`/nurse/patients/record?patientId=${p.id}`} className="btn btn-primary btn-sm">
                          Record Vitals
                        </Link>
                      </td>
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
