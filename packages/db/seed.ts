import { PrismaClient, Role } from '@prisma/client'; // ts reload
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from apps/web/.env
dotenv.config({ path: path.resolve(__dirname, '../../apps/web/.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default clinic
  const clinic = await prisma.clinic.upsert({
    where: { slug: 'central-hospital' }, 
    update: {},
    create: {
      name: 'Central Hospital (Seed)',
      slug: 'central-hospital',
    },
  });

  console.log(`✅ Clinic ensured: ${clinic.name}`);

  // Create root admin (User requested credentials)
  const adminEmail = 'madhavantt2017@gmail.com';
  const rawPassword = '@123';
  const passwordHash = bcrypt.hashSync(rawPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      clinicId: clinic.id,
    },
  });

  console.log(`✅ Admin user ensured: ${adminEmail}`);
  console.log(`🔐 Admin Password is set to: ${rawPassword}`);

  // Create Dummy Doctor
  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@chr-system.local' },
    update: {},
    create: {
      email: 'doctor@chr-system.local',
      passwordHash: bcrypt.hashSync('Doctor123!', 12),
      role: Role.DOCTOR,
      clinicId: clinic.id,
    },
  });
  console.log(`✅ Doctor user ensured: doctor@chr-system.local`);

  // Create Dummy Nurse
  const nurseUser = await prisma.user.upsert({
    where: { email: 'nurse@chr-system.local' },
    update: {},
    create: {
      email: 'nurse@chr-system.local',
      passwordHash: bcrypt.hashSync('Nurse123!', 12),
      role: Role.NURSE,
      clinicId: clinic.id,
    },
  });
  console.log(`✅ Nurse user ensured: nurse@chr-system.local`);

  // Create Dummy Patient User
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@chr-system.local' },
    update: {},
    create: {
      email: 'patient@chr-system.local',
      passwordHash: bcrypt.hashSync('Patient123!', 12),
      role: Role.PATIENT,
      clinicId: clinic.id,
    },
  });
  
  // Create Dummy Receptionist
  const receptionistUser = await prisma.user.upsert({
    where: { email: 'receptionist@chr-system.local' },
    update: {},
    create: {
      email: 'receptionist@chr-system.local',
      passwordHash: bcrypt.hashSync('Reception123!', 12),
      role: Role.RECEPTIONIST,
      clinicId: clinic.id,
    },
  });
  console.log(`✅ Receptionist user ensured: receptionist@chr-system.local`);

  // Create Dummy Lab Tech
  const labTechUser = await prisma.user.upsert({
    where: { email: 'labtech@chr-system.local' },
    update: {},
    create: {
      email: 'labtech@chr-system.local',
      passwordHash: bcrypt.hashSync('Lab123!', 12),
      role: Role.LAB_TECH,
      clinicId: clinic.id,
    },
  });
  console.log(`✅ Lab Tech user ensured: labtech@chr-system.local`);
  
  // Create Dummy Patient Profile linked to Doctor and Nurse
  const patientProfile1 = await prisma.patient.upsert({
    where: { mrn: 'MRN-202606-0001' },
    update: {},
    create: {
      mrn: 'MRN-202606-0001',
      firstName: 'Priya',
      lastName: 'Nair',
      dob: new Date('1990-05-15'),
      gender: 'FEMALE',
      bloodType: 'B+',
      allergies: ['Peanuts'],
      phone: '+91 98765 43210',
      clinicId: clinic.id,
      userId: patientUser.id,
      assignedDoctorId: doctorUser.id,
      assignedNurseId: nurseUser.id,
    },
  });

  const patientProfile2 = await prisma.patient.upsert({
    where: { mrn: 'MRN-202606-0002' },
    update: {},
    create: {
      mrn: 'MRN-202606-0002',
      firstName: 'Karthik',
      lastName: 'Rajan',
      dob: new Date('1985-11-20'),
      gender: 'MALE',
      bloodType: 'O+',
      allergies: [],
      phone: '+91 91234 56789',
      clinicId: clinic.id,
      assignedDoctorId: doctorUser.id,
      assignedNurseId: nurseUser.id,
    },
  });

  console.log(`✅ Patient profiles ensured: Priya Nair, Karthik Rajan`);

  // Seed some vitals for Priya
  await prisma.vitals.create({
    data: {
      patientId: patientProfile1.id,
      recordedById: nurseUser.id,
      clinicId: clinic.id,
      bpSystolic: 120,
      bpDiastolic: 80,
      heartRate: 72,
      spo2: 99,
      temperatureF: 98.6,
      weightKg: 65,
    }
  });

  console.log(`✅ Seeded vitals for Priya Nair`);

  // Seed an Appointment for Priya
  await prisma.appointment.create({
    data: {
      patientId: patientProfile1.id,
      doctorId: doctorUser.id,
      clinicId: clinic.id,
      scheduledStart: new Date(new Date().setHours(10, 0, 0, 0)), // Today at 10 AM
      scheduledEnd: new Date(new Date().setHours(10, 30, 0, 0)),
      type: 'CONSULTATION',
      status: 'PENDING',
      reason: 'Routine checkup and blood pressure review',
    }
  });
  console.log(`✅ Seeded appointment for Priya Nair`);

  // Seed a Prescription for Priya
  await prisma.prescription.create({
    data: {
      patientId: patientProfile1.id,
      doctorId: doctorUser.id,
      clinicId: clinic.id,
      medicationName: 'Amlodipine',
      dosage: '5',
      unit: 'mg',
      frequency: 'Once daily in the morning',
      route: 'Oral',
      startDate: new Date(),
      isActive: true,
      notes: 'For hypertension management',
    }
  });
  console.log(`✅ Seeded prescription for Priya Nair`);
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
