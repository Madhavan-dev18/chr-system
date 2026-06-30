import { PrismaClient, Role, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { faker } from '@faker-js/faker';
import crypto from 'crypto';

dotenv.config({ path: path.resolve(__dirname, '../../apps/web/.env') });

const prisma = new PrismaClient();

const RECORD_ENCRYPTION_KEY = process.env.RECORD_ENCRYPTION_KEY;
if (!RECORD_ENCRYPTION_KEY) {
  throw new Error("RECORD_ENCRYPTION_KEY is missing from environment variables.");
}

const encryptionKey = Buffer.from(RECORD_ENCRYPTION_KEY, 'base64');

function encryptRecord(plaintext: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { ciphertext, iv, authTag };
}

async function main() {
  console.log('🌱 Starting Dynamic Database Seeding with Faker...');

  // Reset database safely by deleting records if necessary, or just upsert
  await prisma.medicalRecord.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.vitals.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.clinic.deleteMany({});

  const clinicsData = [
    { name: 'Central Hospital', slug: 'central-hospital' },
    { name: 'Westside Clinic', slug: 'westside-clinic' }
  ];

  const clinics = [];
  for (const c of clinicsData) {
    const clinic = await prisma.clinic.create({ data: c });
    clinics.push(clinic);
    console.log(`✅ Created Clinic: ${clinic.name}`);
  }

  // Create Users (5 total: 1 Admin, 2 Doctors, 2 Nurses spread across clinics)
  const passwordHash = bcrypt.hashSync('@123', 12);
  
  const users = [
    { email: 'admin@central.local', role: Role.ADMIN, clinicId: clinics[0].id },
    { email: 'doctor@central.local', role: Role.DOCTOR, clinicId: clinics[0].id },
    { email: 'nurse@central.local', role: Role.NURSE, clinicId: clinics[0].id },
    { email: 'doctor@westside.local', role: Role.DOCTOR, clinicId: clinics[1].id },
    { email: 'nurse@westside.local', role: Role.NURSE, clinicId: clinics[1].id },
  ];

  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        role: u.role,
        clinicId: u.clinicId,
      }
    });
    createdUsers.push(user);
    console.log(`✅ Created ${u.role}: ${u.email}`);
  }

  const doctors = createdUsers.filter(u => u.role === Role.DOCTOR);
  const nurses = createdUsers.filter(u => u.role === Role.NURSE);

  // Generate 50 Patients per clinic
  console.log('Generating 100 patients (50 per clinic)...');
  const allPatients = [];

  for (const clinic of clinics) {
    const clinicDoc = doctors.find(d => d.clinicId === clinic.id);
    const clinicNurse = nurses.find(n => n.clinicId === clinic.id);

    const patientsData = Array.from({ length: 50 }).map(() => ({
      mrn: `MRN-${faker.number.int({ min: 100000, max: 999999 })}`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      dob: faker.date.birthdate({ min: 18, max: 90, mode: 'age' }),
      gender: faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE, Gender.OTHER]),
      bloodType: faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
      allergies: faker.helpers.arrayElements(['Peanuts', 'Penicillin', 'Dust', 'Latex', 'Pollen'], { min: 0, max: 2 }),
      phone: faker.phone.number(),
      clinicId: clinic.id,
      assignedDoctorId: clinicDoc?.id,
      assignedNurseId: clinicNurse?.id,
    }));

    const insertedPatients = await prisma.$transaction(
      patientsData.map(p => prisma.patient.create({ data: p }))
    );
    allPatients.push(...insertedPatients);
  }
  console.log('✅ Created 100 Patients.');

  // Create Encrypted Medical Records
  console.log('Generating Medical Records...');
  for (const patient of allPatients) {
    // 2 records per patient
    const recordsToCreate = Array.from({ length: 2 }).map(() => {
      const plaintextNote = faker.lorem.paragraphs(2);
      const { ciphertext, iv, authTag } = encryptRecord(plaintextNote);

      return prisma.medicalRecord.create({
        data: {
          patientId: patient.id,
          doctorId: patient.assignedDoctorId!,
          clinicId: patient.clinicId,
          recordType: 'CLINICAL_NOTE',
          encryptedContent: new Uint8Array(ciphertext),
          iv: new Uint8Array(iv),
          authTag: new Uint8Array(authTag),
          diagnosisCodes: [faker.helpers.arrayElement(['J01.90', 'E11.9', 'I10', 'M54.5'])],
        }
      });
    });
    
    await prisma.$transaction(recordsToCreate);
  }
  console.log('✅ Created Encrypted Medical Records.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🏁 Seeding complete.');
  });
