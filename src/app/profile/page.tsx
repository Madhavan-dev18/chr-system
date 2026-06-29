"use client";

import { HealthProfileForm } from "@/components/health-profile-form";
import { getUserProfile } from "@/lib/user";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { HealthProfile, User } from "@/lib/definitions";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function ProfileFormSkeleton() {
  return (
      <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
          <div className="w-full">
              <Skeleton className="h-10 w-1/2 mb-6" />
              <Card>
                  <CardHeader>
                      <Skeleton className="h-8 w-1/3" />
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                      <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                      <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                      <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                  </CardContent>
              </Card>
          </div>
          <Skeleton className="h-12 w-32" />
      </div>
  )
}

export default function ProfilePage() {
  const [user, authLoading] = useAuthState(auth);
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    };
    if (!user) {
        router.push('/login');
        return;
    };

    setLoading(true);
    getUserProfile(user.uid).then(userProfile => {
        if (userProfile) {
            setDbUser(userProfile);
            setProfile(userProfile.profile || null);
        }
        setLoading(false);
    });
  }, [user, authLoading, router]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Manage Your Health Profile</h1>
        <p className="text-muted-foreground">Keep your information up-to-date for accurate records.</p>
      </div>
      {loading || authLoading ? <ProfileFormSkeleton /> : <HealthProfileForm profile={profile} />}
    </div>
  );
}
