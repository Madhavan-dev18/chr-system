import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TopBar } from '@/components/layout/TopBar';
import { formatDate, calculateAge } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Users, Activity } from 'lucide-react';

export const metadata = { title: 'My Patients' };

export default async function DoctorPatientsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'DOCTOR') redirect('/unauthorized');

  const patients = await prisma.patient.findMany({
    where: { clinicId: session.user.clinicId!, assignedDoctorId: session.user.id, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      vitals: { orderBy: { recordedAt: 'desc' }, take: 1,
        select: { spo2: true, heartRate: true, bpSystolic: true, bpDiastolic: true, recordedAt: true } },
      _count: { select: { appointments: { where: { status: { in: ['PENDING', 'CONFIRMED'] } } } } },
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
                <thead><tr>
                  <th>MRN</th><th>Patient</th><th>Age / Gender</th>
                  <th>Latest Vitals</th><th>Upcoming Appts</th><th>Registered</th>
                </tr></thead>
                <tbody>
                  {patients.map((p: any) => {
                    const v = p.vitals[0];
                    const isCritical = v && (v.spo2 && v.spo2 < 90 || v.heartRate && v.heartRate > 150 || v.bpSystolic && v.bpSystolic > 180);
                    return (
                      <tr key={p.id}>
                        <td><span className="font-mono text-xs text-accent">{p.mrn}</span></td>
                        <td>
                          <Link href={`/doctor/patients/${p.id}`} className="font-semibold text-foreground hover:text-accent transition-colors">
                            {p.firstName} {p.lastName}
                          </Link>
                        </td>
                        <td>{calculateAge(p.dob)}y / {p.gender}</td>
                        <td>
                          {v ? (
                            <span className={`text-xs font-mono ${isCritical ? 'text-red font-bold' : 'text-muted'}`}>
                              {v.bpSystolic}/{v.bpDiastolic} mmHg · SpO₂ {v.spo2}%
                              {isCritical && ' ⚠️'}
                            </span>
                          ) : <span className="text-muted text-xs">No vitals</span>}
                        </td>
                        <td>
                          {p._count.appointments > 0
                            ? <Badge label={`${p._count.appointments} upcoming`} variant="blue" dot={false} />
                            : <span className="text-muted text-xs">None</span>}
                        </td>
                        <td className="text-xs text-muted">{formatDate(p.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
