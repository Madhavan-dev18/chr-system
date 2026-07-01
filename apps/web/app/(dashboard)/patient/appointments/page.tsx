import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TopBar } from '@/components/layout/TopBar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/utils';
import { Calendar } from 'lucide-react';

export const metadata = { title: 'My Appointments' };

export default async function PatientAppointmentsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'PATIENT') redirect('/unauthorized');

  const patient = await prisma.patient.findFirst({
    where: { userId: session.user.id, clinicId: session.user.clinicId! },
  });
  if (!patient) redirect('/unauthorized');

  const appointments = await prisma.appointment.findMany({
    where: { patientId: patient.id },
    orderBy: { scheduledStart: 'desc' },
    take: 50,
    include: { doctor: { select: { email: true } } },
  });

  return (
    <>
      <TopBar title="My Appointments" />
      <div className="p-6">
        {appointments.length === 0 ? (
          <div className="card">
            <EmptyState icon={Calendar} title="No Appointments" description="You have no scheduled appointments." />
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((a: any) => (
              <div key={a.id} className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-muted flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{a.appointmentType.replace('_', ' ')}</p>
                  <p className="text-sm text-muted">{formatDateTime(a.scheduledStart)} · {a.durationMinutes} min</p>
                  <p className="text-xs text-muted">Dr. {a.doctor.email}</p>
                  {a.chiefComplaint && <p className="text-xs text-muted mt-1 truncate">{a.chiefComplaint}</p>}
                </div>
                <Badge label={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
