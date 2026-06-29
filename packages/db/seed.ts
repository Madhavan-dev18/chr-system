import { PrismaClient, Role } from '@prisma/client';
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
    where: { id: '00000000-0000-0000-0000-000000000001' }, // Dummy UUID
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
  
  // Create Dummy Patient Profile linked to Doctor and Nurse
  const patientProfile = await prisma.patient.upsert({
    where: { mrn: 'MRN-202606-0001' },
    update: {},
    create: {
      mrn: 'MRN-202606-0001',
      firstName: 'John',
      lastName: 'Doe',
      dob: new Date('1980-01-01'),
      gender: 'MALE',
      bloodType: 'O+',
      allergies: ['Penicillin'],
      phone: '+15551234567',
      clinicId: clinic.id,
      userId: patientUser.id,
      assignedDoctorId: doctorUser.id,
      assignedNurseId: nurseUser.id,
    },
  });
  console.log(`✅ Patient profile ensured: MRN-202606-0001`);
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
