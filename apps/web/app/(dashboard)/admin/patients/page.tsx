import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TopBar } from '@/components/layout/TopBar';
import { formatDate, calculateAge } from '@/lib/utils';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export const metadata = { title: 'Patients — Admin' };

export default async function AdminPatientsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/unauthorized');

  const patients = await prisma.patient.findMany({
    where: { clinicId: session.user.clinicId!, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { assignedDoctor: { select: { email: true } } },
  });

  return (
    <>
      <TopBar title="All Patients" subtitle={`${patients.length} registered`}
        actions={
          <Link href="/receptionist/patients" className="btn btn-primary btn-sm">
            <UserPlus className="w-4 h-4" />Register
          </Link>
        }
      />
      <div className="p-6">
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr>
                <th>MRN</th><th>Name</th><th>Age</th><th>Gender</th>
                <th>Assigned Doctor</th><th>Registered</th>
              </tr></thead>
              <tbody>
                {patients.map((p: any) => (
                  <tr key={p.id} className="cursor-pointer hover:bg-surface-hover">
                    <td><span className="font-mono text-xs text-accent">{p.mrn}</span></td>
                    <td className="font-semibold text-foreground">{p.firstName} {p.lastName}</td>
                    <td>{calculateAge(p.dob)}</td>
                    <td>{p.gender}</td>
                    <td className="text-xs">{p.assignedDoctor?.email ?? <span className="text-muted">Unassigned</span>}</td>
                    <td className="text-xs text-muted">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
                {patients.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted py-10">No patients registered</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
