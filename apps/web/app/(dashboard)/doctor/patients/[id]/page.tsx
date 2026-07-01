import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TopBar } from '@/components/layout/TopBar';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatDateTime, calculateAge } from '@/lib/utils';
import Link from 'next/link';
import { FileText, Activity, Pill, FlaskConical, Calendar, User } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await prisma.patient.findUnique({ where: { id }, select: { firstName: true, lastName: true } });
  return { title: patient ? `${patient.firstName} ${patient.lastName} — Chart` : 'Patient Chart' };
}

export default async function PatientChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || !['DOCTOR', 'NURSE', 'ADMIN'].includes(session.user.role)) redirect('/unauthorized');

  const patient = await prisma.patient.findUnique({
    where: { id, clinicId: session.user.clinicId! },
    include: {
      assignedDoctor: { select: { email: true } },
      assignedNurse: { select: { email: true } },
      vitals: { orderBy: { recordedAt: 'desc' }, take: 5 },
      medicalRecords: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' }, take: 10,
        select: { id: true, recordType: true, createdAt: true, diagnosisCodes: true },
      },
      prescriptions: { orderBy: { createdAt: 'desc' }, take: 5,
        include: { doctor: { select: { email: true } } } },
      labResults: { orderBy: { createdAt: 'desc' }, take: 5,
        include: { orderedBy: { select: { email: true } } } },
      appointments: {
        where: { status: { in: ['PENDING', 'CONFIRMED'] } },
        orderBy: { scheduledStart: 'asc' }, take: 5,
      },
    },
  });

  if (!patient || patient.deletedAt) notFound();

  const latestVitals = patient.vitals[0];

  return (
    <>
      <TopBar
        title={`${patient.firstName} ${patient.lastName}`}
        subtitle={`MRN: ${patient.mrn} · ${calculateAge(patient.dob)}y · ${patient.gender}`}
      />
      <div className="p-6 space-y-5">
        {/* Demographics card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-accent" />
              <h2 className="font-bold text-foreground">Demographics</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[
                ['Date of Birth', formatDate(patient.dob)],
                ['Blood Type', patient.bloodType ?? '—'],
                ['Gender', patient.gender],
                ['Phone', patient.phone ?? '—'],
                ['Email', patient.email ?? '—'],
                ['Emergency Contact', patient.emergencyContact ?? '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="label text-2xs">{k}</p>
                  <p className="text-foreground font-medium">{v}</p>
                </div>
              ))}
            </div>
            {patient.allergies.length > 0 && (
              <div className="mt-4">
                <p className="label text-2xs mb-1">Known Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((a: any) => (
                    <span key={a} className="badge badge-red">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Latest Vitals */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-green" />
              <h2 className="font-bold text-foreground">Latest Vitals</h2>
            </div>
            {latestVitals ? (
              <div className="space-y-2 text-sm">
                {[
                  ['BP', latestVitals.bpSystolic ? `${latestVitals.bpSystolic}/${latestVitals.bpDiastolic} mmHg` : '—'],
                  ['Heart Rate', latestVitals.heartRate ? `${latestVitals.heartRate} bpm` : '—'],
                  ['SpO₂', latestVitals.spo2 ? `${latestVitals.spo2}%` : '—'],
                  ['Temp', latestVitals.temperatureF ? `${latestVitals.temperatureF}°F` : '—'],
                  ['RR', latestVitals.respiratoryRate ? `${latestVitals.respiratoryRate}/min` : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-muted">{k}</span>
                    <span className="font-mono font-semibold text-foreground">{v}</span>
                  </div>
                ))}
                <p className="text-2xs text-muted mt-2">{formatDateTime(latestVitals.recordedAt)}</p>
              </div>
            ) : (
              <p className="text-sm text-muted">No vitals recorded</p>
            )}
          </div>
        </div>

        {/* Medical Records */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue" />
              <h2 className="font-bold text-foreground">Medical Records</h2>
            </div>
          </div>
          <table className="data-table">
            <thead><tr><th>Type</th><th>ICD-10 Codes</th><th>Date</th></tr></thead>
            <tbody>
              {patient.medicalRecords.map((r: any) => (
                <tr key={r.id}>
                  <td><span className="font-semibold text-foreground text-sm">{r.recordType.replace('_', ' ')}</span></td>
                  <td><span className="font-mono text-xs text-blue">{r.diagnosisCodes.join(', ') || '—'}</span></td>
                  <td className="text-xs text-muted">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
              {patient.medicalRecords.length === 0 && (
                <tr><td colSpan={3} className="text-center text-muted py-6">No records</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Prescriptions & Labs in columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="w-4 h-4 text-purple" />
              <h2 className="font-bold text-foreground">Prescriptions</h2>
            </div>
            <div className="space-y-2">
              {patient.prescriptions.map((p: any) => (
                <div key={p.id} className="card-inset">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{p.diagnosis}</p>
                    <Badge label={p.status} />
                  </div>
                  <p className="text-xs text-muted mt-1">{formatDate(p.createdAt)}</p>
                </div>
              ))}
              {patient.prescriptions.length === 0 && <p className="text-sm text-muted">No prescriptions</p>}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-4 h-4 text-yellow" />
              <h2 className="font-bold text-foreground">Lab Orders</h2>
            </div>
            <div className="space-y-2">
              {patient.labResults.map((l: any) => (
                <div key={l.id} className="card-inset">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground truncate">{l.testName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge label={l.status} />
                    </div>
                  </div>
                  <p className="text-xs text-muted mt-1">{formatDate(l.createdAt)}</p>
                </div>
              ))}
              {patient.labResults.length === 0 && <p className="text-sm text-muted">No lab orders</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
