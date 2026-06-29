import type { User } from './definitions';

export const mockUsersList: User[] = [
  {
    healthId: '1234567890',
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
  {
    healthId: '0987654321',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
  },
  {
    healthId: '1122334455',
    name: 'Peter Jones',
    email: 'peter.jones@example.com',
  },
  {
    healthId: '5566778899',
    name: 'Mary Johnson',
    email: 'mary.johnson@example.com',
  },
];

export const mockUser: User = {
  healthId: '1234567890',
  name: 'John Doe',
  email: 'john.doe@example.com',
  profile: {
    personalInfo: {
      name: 'John Doe',
      age: 34,
      gender: 'Male',
      contact: '+1-202-555-0104',
      address: '123 Main St, Anytown, USA',
      email: 'john.doe@example.com',
    },
    medicalInfo: {
      bloodGroup: 'O+',
      allergies: 'Peanuts, Penicillin',
      chronicDiseases: 'Asthma',
      medicalHistory: 'Broken arm in 2010. Appendectomy in 2015.',
    },
    records: {
      prescriptions: 'Albuterol Inhaler, as needed.\nAmoxicillin, 500mg, 3 times a day for 7 days (finished course).',
      labReports: 'Cholesterol Panel (2023): Total 180 mg/dL, LDL 100 mg/dL, HDL 60 mg/dL.\nBlood Sugar (2023): 90 mg/dL (fasting).',
      vaccinationRecords: 'COVID-19 (Pfizer, 2 doses + 1 booster)\nFlu Shot (2023)\n_Tetanus (2020)',
    },
    lifestyle: {
      diet: 'Balanced diet, prefers low-carb.',
      exercise: 'Runs 3 times a week, 5km per run. Gym twice a week.',
      habits: 'Non-smoker, occasional social drinking.',
    },
  },
};
