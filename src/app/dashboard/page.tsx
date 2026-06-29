"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/user";
import { User, HealthProfile } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Pill } from "lucide-react";

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

function TodaysMedications({ medications }: { medications?: HealthProfile['medications'] }) {
    if (!medications || medications.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Today's Medications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-4">
                        <p>No medications scheduled for today.</p>
                        <Button variant="link" asChild><Link href="/medications">Add Medication</Link></Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Today's Medications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {medications.map((med, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-4">
                            <Pill className="h-6 w-6 text-primary" />
                            <div>
                                <p className="font-semibold">{med.name}</p>
                                <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{med.time}</span>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-40" />
                </div>
                 <Skeleton className="h-10 w-24" />
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
                         <Skeleton className="h-12 w-full" />
                    </CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" />
                    </CardContent></Card>
                </div>
            </div>
        </div>
    )
}


export default function DashboardPage() {
  const [firebaseUser, authLoading] = useAuthState(auth);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const userProfile = await getUserProfile(firebaseUser.uid);
      setUser(userProfile);
      setLoading(false);
    };

    fetchProfile();
  }, [firebaseUser, authLoading, router]);

  if (loading || authLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return <div className="text-center py-16"><p>Could not load user profile.</p></div>;
  }
  
  const { profile } = user;
  const { personalInfo, medicalInfo, records, lifestyle, illnessRecords, medications } = profile || ({} as HealthProfile);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
            <h1 className="font-headline text-3xl font-bold">Welcome, {user.name ? user.name.split(' ')[0] : 'User'}!</h1>
            <p className="text-muted-foreground font-mono">Health ID: {user.healthId}</p>
        </div>
        <Button asChild><Link href="/profile">Edit Profile</Link></Button>
       </div>

      {!profile ? (
        <div className="text-center py-16 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold">Your Health Profile is Empty</h2>
            <p className="text-muted-foreground mt-2 mb-6">Fill out your profile to see your complete health summary here.</p>
            <Button asChild><Link href="/profile">Create Your Profile</Link></Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-6">
            <InfoSection title="Personal Information">
                <InfoItem label="Name" value={personalInfo?.name} />
                <InfoItem label="Age" value={personalInfo?.age} />
                <InfoItem label="Gender" value={personalInfo?.gender} />
                <InfoItem label="Contact" value={personalInfo?.contact} />
                <InfoItem label="Email" value={personalInfo?.email} />
                <InfoItem label="Address" value={personalInfo?.address} />
            </InfoSection>

            <InfoSection title="Medical Information">
                <InfoItem label="Blood Group" value={medicalInfo?.bloodGroup} isBadge />
                <InfoItem label="Allergies" value={medicalInfo?.allergies} />
                <InfoItem label="Chronic Diseases" value={medicalInfo?.chronicDiseases?.map(d => d.disease).join(', ')} />
            </InfoSection>

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

            <TodaysMedications medications={medications} />

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
                <InfoItem label="Habits" value={lifestyle?.habits} />
            </InfoSection>
            </div>
        </div>
      )}
    </div>
  );
}
