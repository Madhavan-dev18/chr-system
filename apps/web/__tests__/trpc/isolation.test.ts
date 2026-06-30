import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { TRPCError } from '@trpc/server';
import { Role } from '@chr/db';

vi.mock('@upstash/ratelimit', () => {
  const RatelimitMock = vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({ success: true }),
  }));
  (RatelimitMock as any).slidingWindow = vi.fn();
  return { Ratelimit: RatelimitMock };
});

import { appRouter } from '../../server/trpc/router';
import { prisma, tenantStorage } from '../../lib/prisma';
import { encryptRecord } from '../../lib/crypto';

describe('TRPC Clinic Isolation Boundary', () => {
  let clinicAId: string;
  let clinicBId: string;
  let doctorAId: string;
  let doctorBId: string;
  let recordAId: string;

  beforeAll(async () => {
    // Only proceed if we can connect to a DB
    try {
      await prisma.$connect();
    } catch (e) {
      console.warn('Skipping integration tests - no DB connection');
      return;
    }

    const clinicA = await prisma.clinic.create({ data: { name: 'Test Clinic A - ' + Date.now() } });
    const clinicB = await prisma.clinic.create({ data: { name: 'Test Clinic B - ' + Date.now() } });
    clinicAId = clinicA.id;
    clinicBId = clinicB.id;

    const docA = await prisma.user.create({
      data: { email: `doctorA_${Date.now()}@test.com`, role: Role.DOCTOR, clinicId: clinicAId, passwordHash: 'hash' }
    });
    doctorAId = docA.id;

    const docB = await prisma.user.create({
      data: { email: `doctorB_${Date.now()}@test.com`, role: Role.DOCTOR, clinicId: clinicBId, passwordHash: 'hash' }
    });
    doctorBId = docB.id;

    const patientA = await prisma.patient.create({
      data: {
        clinicId: clinicAId,
        firstName: 'Patient',
        lastName: 'A',
        mrn: `MRN-TEST-${Date.now()}`,
        dob: new Date('1990-01-01'),
        gender: 'MALE',
        assignedDoctorId: doctorAId,
        allergies: [],
      }
    });

    const { ciphertext, iv, authTag } = encryptRecord("Test encrypted content");
    const recordA = await prisma.medicalRecord.create({
      data: {
        clinicId: clinicAId,
        patientId: patientA.id,
        doctorId: doctorAId,
        recordType: 'CONSULTATION',
        encryptedContent: Buffer.from(ciphertext),
        iv: Buffer.from(iv),
        authTag: Buffer.from(authTag),
      }
    });
    recordAId = recordA.id;
  });

  afterAll(async () => {
    if (!clinicAId) return; // Didn't run
    
    // Cleanup
    await prisma.auditLog.deleteMany({ where: { clinicId: { in: [clinicAId, clinicBId] } } });
    await prisma.medicalRecord.deleteMany({ where: { id: recordAId } });
    await prisma.patient.deleteMany({ where: { clinicId: clinicAId } });
    await prisma.user.deleteMany({ where: { id: { in: [doctorAId, doctorBId] } } });
    await prisma.clinic.deleteMany({ where: { id: { in: [clinicAId, clinicBId] } } });
    await prisma.$disconnect();
  });

  it('prevents cross-tenant queries for medical records', async () => {
    if (!clinicBId) return; // Skip if no DB

    const sessionClinicB = {
      user: {
        id: doctorBId,
        role: Role.DOCTOR,
        clinicId: clinicBId,
        email: 'doctorB@test.com',
      },
      expires: '9999-12-31T23:59:59.999Z',
    };

    const mockCtx = {
      session: sessionClinicB,
      user: sessionClinicB.user,
      ip: '127.0.0.1',
      userAgent: 'vitest',
      requestId: 'test-req-123',
      db: prisma,
    };

    await tenantStorage.run(clinicBId, async () => {
      const caller = appRouter.createCaller(mockCtx);

      try {
        await caller.records.getDecryptedContent({ recordId: recordAId });
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(TRPCError);
        expect(['NOT_FOUND', 'FORBIDDEN']).toContain(error.code);
      }
    });
  });
});
