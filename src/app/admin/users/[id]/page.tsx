

"use client";

import { useEffect, useState } from "react";
import { getUserByHealthId } from "@/lib/user";
import { User, HealthProfile } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

type InfoItemProps = {
  label: string;
  value?: string | number | null | string[];
  isBadge?: boolean;
};

function InfoItem({ label, value, isBadge = false }: InfoItemProps) {
  if (!value && value !== 0) return null;
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <div className="col-span-2">
        {isBadge ? <Badge variant="secondary">{displayValue}</Badge> : <span>{displayValue}</span>}
      </div>
    </div>
  );
}

function InfoSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}

function ProfileSkeleton() {
    return (
        <div className="space-y-6">
             <Skeleton className="h-8 w-32 mb-4" />
            <div className="flex items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-40" />
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-6">
                    <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" />
                    </CardContent></Card>
                     <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" />
                    </CardContent></Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" />
                    </CardContent></Card>
                </div>
            </div>
        </div>
    )
}

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const userProfile = await getUserByHealthId(id);
      setUser(userProfile);
      setLoading(false);
    };

    if (id) {
      fetchUser();
    }
  }, [id]);


  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Users</Link>
        </Button>
        <div className="text-center py-16">
          <p className="text-lg font-semibold">User not found.</p>
          <p className="text-muted-foreground">Could not find a user with Health ID: {id}</p>
        </div>
      </div>
    );
  }

  const { profile } = user;
  const { personalInfo, medicalInfo, records, lifestyle, illnessRecords, birthHistory, childhoodIllnesses, medications } = profile || ({} as HealthProfile);

  const childhoodIllnessList = (childhoodIllnesses && typeof childhoodIllnesses === 'object') ? Object.entries(childhoodIllnesses)
    .filter(([_, value]) => value === true)
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
    : [];


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Users</Link>
          </Button>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-headline text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground font-mono">Health ID: {user.healthId}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete User
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user's account and remove their data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {!profile ? (
         <div className="text-center py-16 border rounded-lg">
            <p className="text-lg font-semibold">{user.name} has not filled out their health profile.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-6">
            <InfoSection title="Personal Information">
                <InfoItem label="Name" value={personalInfo?.name} />
                <InfoItem label="Age" value={personalInfo?.age} />
                <InfoItem label="Date of Birth" value={personalInfo?.dateOfBirth} />
                <InfoItem label="Gender" value={personalInfo?.gender} />
                <InfoItem label="Contact" value={personalInfo?.contact} />
                <InfoItem label="Email" value={personalInfo?.email} />
                <InfoItem label="Nationality" value={personalInfo?.nationality} />
                <InfoItem label="Address" value={personalInfo?.address} />
            </InfoSection>
            
            {personalInfo?.emergencyContactName && (
                <InfoSection title="Emergency Contact">
                    <InfoItem label="Name" value={personalInfo?.emergencyContactName} />
                    <InfoItem label="Phone" value={personalInfo?.emergencyContactPhone} />
                    <InfoItem label="Relationship" value={personalInfo?.emergencyContactRelationship} />
                </InfoSection>
            )}

            <InfoSection title="Medical Information">
                <InfoItem label="Blood Group" value={medicalInfo?.bloodGroup} isBadge />
                <InfoItem label="Allergies" value={medicalInfo?.allergies} />
            </InfoSection>
            
            {medicalInfo?.chronicDiseases && medicalInfo.chronicDiseases.length > 0 && (
                <InfoSection title="Chronic Diseases">
                    {medicalInfo.chronicDiseases.map((disease, index) => (
                        <div key={index} className="p-3 border-b last:border-b-0">
                           <h4 className="font-semibold">{disease.disease}</h4>
                           <p className="text-sm mt-1">Diagnosed: {disease.diagnosedDate}</p>
                           <p className="text-sm mt-1">Medication: {disease.medication}</p>
                        </div>
                    ))}
                </InfoSection>
            )}

             {medicalInfo?.familyHistory && medicalInfo.familyHistory.length > 0 && (
                <InfoSection title="Family History">
                    {medicalInfo.familyHistory.map((relative, index) => (
                        <div key={index} className="p-3 border-b last:border-b-0">
                           <h4 className="font-semibold">{relative.relation}</h4>
                           <p className="text-sm mt-1">Condition: {relative.condition}</p>
                           {relative.ageOfOnset && <p className="text-xs text-muted-foreground">Age of Onset: {relative.ageOfOnset}</p>}
                        </div>
                    ))}
                </InfoSection>
            )}


            {illnessRecords && illnessRecords.length > 0 && (
                 <InfoSection title="Illness History">
                    {illnessRecords.map((illness, index) => (
                        <div key={index} className="p-3 border-b last:border-b-0">
                           <h4 className="font-semibold">{illness.illnessName} <Badge variant="outline" className="ml-2">{illness.status}</Badge></h4>
                           <p className="text-xs text-muted-foreground">Diagnosed: {illness.diagnosisDate}</p>
                           <p className="text-sm mt-1">Symptoms: {illness.symptoms}</p>
                           <p className="text-sm mt-1">Treatment: {illness.treatment}</p>
                           <p className="text-sm mt-1">Physician: {illness.physician}</p>
                        </div>
                    ))}
                </InfoSection>
            )}

            </div>

            <div className="lg:col-span-2 space-y-6">
                
            {birthHistory && Object.values(birthHistory).some(v => v) && (
                <InfoSection title="Birth History">
                    <InfoItem label="Birth Weight" value={birthHistory?.birthWeight ? `${birthHistory.birthWeight} kg` : ''} />
                    <InfoItem label="Birth Length" value={birthHistory?.birthLength ? `${birthHistory.birthLength} cm` : ''} />
                    <InfoItem label="Gestational Age" value={birthHistory?.gestationalAge ? `${birthHistory.gestationalAge} weeks` : ''} />
                    <InfoItem label="Delivery Type" value={birthHistory?.deliveryType} />
                    <InfoItem label="Birth Complications" value={birthHistory?.birthComplications} />
                </InfoSection>
            )}

            {(childhoodIllnessList.length > 0 || childhoodIllnesses?.otherChildhoodIllnesses) && (
                <InfoSection title="Childhood Illnesses">
                    {childhoodIllnessList.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {childhoodIllnessList.map(illness => (
                                <Badge key={illness} variant="secondary">{illness}</Badge>
                            ))}
                        </div>
                    )}
                    <InfoItem label="Other" value={childhoodIllnesses?.otherChildhoodIllnesses} />
                </InfoSection>
            )}

            {medications && medications.length > 0 && (
                 <InfoSection title="Medications">
                    {medications.map((med, index) => (
                        <div key={index} className="p-3 border-b last:border-b-0 grid grid-cols-4 gap-4 items-center">
                           <span className="font-semibold col-span-1">{med.name}</span>
                           <span className="text-sm col-span-1">{med.dosage}</span>
                           <span className="text-sm text-muted-foreground col-span-1">{med.frequency}</span>
                           <span className="text-sm text-muted-foreground col-span-1">{med.time}</span>
                        </div>
                    ))}
                </InfoSection>
            )}
            
            <InfoSection title="Medical Records">
                <div className="space-y-2">
                <h3 className="font-semibold">Prescriptions</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{records?.prescriptions}</p>
                </div>
                <div className="space-y-2">
                <h3 className="font-semibold">Lab Reports</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{records?.labReports}</p>
                </div>
                <div className="space-y-2">
                <h3 className="font-semibold">Vaccination Records</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{records?.vaccinationRecords}</p>
                </div>
            </InfoSection>

            <InfoSection title="Lifestyle">
                <InfoItem label="Diet" value={lifestyle?.diet} />
                <InfoItem label="Exercise" value={lifestyle?.exercise} />
                <InfoItem label="Alcohol Consumption" value={lifestyle?.alcoholConsumption} />
                <InfoItem label="Smoking Status" value={lifestyle?.smokingStatus} />
                <InfoItem label="Recreational Drug Use" value={lifestyle?.recreationalDrugUse} />
                <InfoItem label="Other Habits" value={lifestyle?.habits} />
            </InfoSection>
            </div>
        </div>
      )}
    </div>
  );
}
