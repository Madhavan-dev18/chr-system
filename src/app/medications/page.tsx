"use client";

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth } from '@/lib/firebase';
import { getUserProfile, updateUserProfile } from '@/lib/user';
import { HealthProfile, User } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, Pill, Clock, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  frequency: z.string().min(1, 'Frequency is required.'),
  time: z.string().min(1, 'Time is required.'),
});

const formSchema = z.object({
  medications: z.array(medicationSchema),
});

type FormValues = z.infer<typeof formSchema>;

function MedicationsSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-4 w-1/2" />

            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg space-y-4">
                         <div className="grid md:grid-cols-2 gap-6">
                             <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                             <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                             <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                             <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
                         </div>
                    </div>
                    <Skeleton className="h-10 w-40" />
                </CardContent>
            </Card>
            <Skeleton className="h-12 w-32" />
        </div>
    )
}

export default function MedicationsPage() {
  const [firebaseUser, authLoading] = useAuthState(auth);
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medications: [],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'medications',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const userProfile = await getUserProfile(firebaseUser.uid);
      if (userProfile?.profile) {
        setProfile(userProfile.profile);
        form.reset({ medications: userProfile.profile.medications || [] });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [firebaseUser, authLoading, router, form]);

  const onSubmit = async (data: FormValues) => {
    if (!firebaseUser || !profile) {
      toast({ title: 'Error', description: 'User profile not found.', variant: 'destructive' });
      return;
    }
    
    setIsSaving(true);
    const updatedProfile: HealthProfile = {
      ...profile,
      medications: data.medications,
    };

    try {
      await updateUserProfile(firebaseUser.uid, updatedProfile);
      toast({ title: 'Success', description: 'Medications updated successfully.' });
      router.push('/dashboard');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update medications.', variant: 'destructive' });
      console.error(error);
    } finally {
        setIsSaving(false);
    }
  };

  if (loading || authLoading) {
    return <MedicationsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Manage Medications</h1>
        <p className="text-muted-foreground">Add and track your medication schedule.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Your Medications</CardTitle>
                    <CardDescription>Add, edit, or remove your medications below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <FormField
                            control={form.control}
                            name={`medications.${index}.name`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Paracetamol" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name={`medications.${index}.dosage`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Dosage</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 500mg" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name={`medications.${index}.frequency`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Frequency</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Twice a day" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name={`medications.${index}.time`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ name: '', dosage: '', frequency: '', time: '' })}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Medication
                    </Button>
                </CardContent>
            </Card>

            <Button type="submit" size="lg" disabled={isSaving}>
                {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                    <><Save className="mr-2 h-4 w-4" /> Save Medications</>
                )}
            </Button>
        </form>
      </Form>
    </div>
  );
}
