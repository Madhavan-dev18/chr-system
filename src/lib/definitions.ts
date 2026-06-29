export type User = {
  healthId: string;
  uid: string;
  name: string;
  email: string;
  createdAt?: any;
  profile?: HealthProfile;
};

export type HealthProfile = {
    personalInfo?: {
        name: string;
        age: number | null;
        gender: 'Male' | 'Female' | 'Other' | '';
        contact: string;
        address: string;
        email?: string;
        dateOfBirth?: string;
        nationality?: string;
        emergencyContactName?: string;
        emergencyContactPhone?: string;
        emergencyContactRelationship?: string;
    };
    birthHistory?: {
        birthWeight?: string;
        birthLength?: string;
        birthComplications?: string;
        deliveryType?: 'Vaginal' | 'C-Section' | 'VBAC' | 'Other' | '';
        gestationalAge?: string;
    };
    childhoodIllnesses?: {
        chickenpox?: boolean;
        measles?: boolean;
        mumps?: boolean;
        rubella?: boolean;
        whoopingCough?: boolean;
        scarletFever?: boolean;
        otherChildhoodIllnesses?: string;
    };
    illnessRecords?: Array<{
        illnessName: string;
        diagnosisDate: string;
        symptoms: string;
        treatment: string;
        status: 'Ongoing' | 'Resolved' | '';
        physician: string;
    }>;
    medicalInfo?: {
        bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '';
        allergies?: string[];
        chronicDiseases?: Array<{
            disease: string;
            diagnosedDate: string;
            medication: string;
        }>;
        pastSurgeries?: Array<{
            surgery: string;
            date: string;
            hospital: string;
            surgeon: string;
        }>;
        familyHistory?: Array<{
            relation: 'Father' | 'Mother' | 'Sibling' | 'Grandparent' | 'Other' | '';
            condition: string;
            ageOfOnset: number | null;
        }>;
    };
    medications?: Array<{
        name: string;
        dosage: string;
        frequency: string;
        time: string;
    }>;
    records?: {
        prescriptions?: string;
        labReports?: string;
        vaccinationRecords?: string;
    };
    lifestyle?: {
        diet?: string;
        exercise?: string;
        habits?: string;
        alcoholConsumption?: 'None' | 'Socially' | 'Moderately' | 'Heavily' | '';
        smokingStatus?: 'Never' | 'Former' | 'Current' | '';
        recreationalDrugUse?: string;
    };
};
