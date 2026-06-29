"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Save, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthProfile } from "@/lib/definitions";
import { updateUserProfile } from "@/lib/user";
import { auth } from "@/lib/firebase";


const profileFormSchema = z.object({
  personalInfo: z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    age: z.coerce.number().positive("Age must be a positive number.").nullable(),
    gender: z.enum(['Male', 'Female', 'Other', '']),
    contact: z.string().min(10, "Contact number is required."),
    email: z.string().email("Invalid email address.").optional(),
    address: z.string().min(5, "Address is required."),
    dateOfBirth: z.string().optional(),
    nationality: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    emergencyContactRelationship: z.string().optional(),
  }),
  birthHistory: z.object({
    birthWeight: z.string().optional(),
    birthLength: z.string().optional(),
    birthComplications: z.string().optional(),
    deliveryType: z.enum(['Vaginal', 'C-Section', 'VBAC', 'Other', '']).optional(),
    gestationalAge: z.string().optional(),
  }),
  childhoodIllnesses: z.object({
    chickenpox: z.boolean().optional(),
    measles: z.boolean().optional(),
    mumps: z.boolean().optional(),
    rubella: z.boolean().optional(),
    whoopingCough: z.boolean().optional(),
    scarletFever: z.boolean().optional(),
    otherChildhoodIllnesses: z.string().optional(),
  }),
  illnessRecords: z.array(z.object({
    illnessName: z.string().min(1, 'Illness name is required.'),
    diagnosisDate: z.string().min(1, 'Diagnosis date is required.'),
    symptoms: z.string().min(1, 'Symptoms are required.'),
    treatment: z.string().min(1, 'Treatment is required.'),
    status: z.enum(['Ongoing', 'Resolved', '']),
    physician: z.string().min(1, 'Physician name is required.'),
  })).optional(),
  medicalInfo: z.object({
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']),
    allergies: z.array(z.string()).optional(),
    chronicDiseases: z.array(z.object({
        disease: z.string(),
        diagnosedDate: z.string(),
        medication: z.string(),
    })).optional(),
    pastSurgeries: z.array(z.object({
        surgery: z.string(),
        date: z.string(),
        hospital: z.string(),
        surgeon: z.string(),
    })).optional(),
    familyHistory: z.array(z.object({
        relation: z.enum(['Father', 'Mother', 'Sibling', 'Grandparent', 'Other', '']),
        condition: z.string().min(1, 'Condition is required.'),
        ageOfOnset: z.coerce.number().positive("Age must be a positive number.").nullable(),
    })).optional(),
  }),
  medications: z.array(z.object({
    name: z.string().min(1, 'Medication name is required.'),
    dosage: z.string().min(1, 'Dosage is required.'),
    frequency: z.string().min(1, 'Frequency is required.'),
    time: z.string().min(1, 'Time is required.'),
  })).optional(),
  records: z.object({
    prescriptions: z.string().optional(),
    labReports: z.string().optional(),
    vaccinationRecords: z.string().optional(),
  }),
  lifestyle: z.object({
    diet: z.string().optional(),
    exercise: z.string().optional(),
    habits: z.string().optional(),
    alcoholConsumption: z.enum(['None', 'Socially', 'Moderately', 'Heavily', '']).optional(),
    smokingStatus: z.enum(['Never', 'Former', 'Current', '']).optional(),
    recreationalDrugUse: z.string().optional(),
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const SectionCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
)

export function HealthProfileForm({ profile }: { profile: HealthProfile | null }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  const defaultValues: Partial<ProfileFormValues> = {
    personalInfo: {
        name: profile?.personalInfo?.name || auth.currentUser?.displayName || '',
        age: profile?.personalInfo?.age || null,
        gender: profile?.personalInfo?.gender || '',
        contact: profile?.personalInfo?.contact || '',
        email: profile?.personalInfo?.email || auth.currentUser?.email || '',
        address: profile?.personalInfo?.address || '',
        dateOfBirth: profile?.personalInfo?.dateOfBirth || '',
        nationality: profile?.personalInfo?.nationality || '',
        emergencyContactName: profile?.personalInfo?.emergencyContactName || '',
        emergencyContactPhone: profile?.personalInfo?.emergencyContactPhone || '',
        emergencyContactRelationship: profile?.personalInfo?.emergencyContactRelationship || '',
    },
    medicalInfo: {
        bloodGroup: profile?.medicalInfo?.bloodGroup || '',
        allergies: profile?.medicalInfo?.allergies || [],
        chronicDiseases: profile?.medicalInfo?.chronicDiseases || [],
        pastSurgeries: profile?.medicalInfo?.pastSurgeries || [],
        familyHistory: profile?.medicalInfo?.familyHistory || [],
    },
    medications: profile?.medications || [],
    records: {
        prescriptions: profile?.records?.prescriptions || '',
        labReports: profile?.records?.labReports || '',
        vaccinationRecords: profile?.records?.vaccinationRecords || '',
    },
    lifestyle: {
        diet: profile?.lifestyle?.diet || '',
        exercise: profile?.lifestyle?.exercise || '',
        habits: profile?.lifestyle?.habits || '',
        alcoholConsumption: profile?.lifestyle?.alcoholConsumption || '',
        smokingStatus: profile?.lifestyle?.smokingStatus || '',
        recreationalDrugUse: profile?.lifestyle?.recreationalDrugUse || '',
    },
    birthHistory: {
        birthWeight: profile?.birthHistory?.birthWeight || '',
        birthLength: profile?.birthHistory?.birthLength || '',
        birthComplications: profile?.birthHistory?.birthComplications || '',
        deliveryType: profile?.birthHistory?.deliveryType || '',
        gestationalAge: profile?.birthHistory?.gestationalAge || '',
    },
    childhoodIllnesses: {
        chickenpox: profile?.childhoodIllnesses?.chickenpox || false,
        measles: profile?.childhoodIllnesses?.measles || false,
        mumps: profile?.childhoodIllnesses?.mumps || false,
        rubella: profile?.childhoodIllnesses?.rubella || false,
        whoopingCough: profile?.childhoodIllnesses?.whoopingCough || false,
        scarletFever: profile?.childhoodIllnesses?.scarletFever || false,
        otherChildhoodIllnesses: profile?.childhoodIllnesses?.otherChildhoodIllnesses || '',
    },
    illnessRecords: profile?.illnessRecords || [],
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  
  const { fields: illnessFields, append: appendIllness, remove: removeIllness } = useFieldArray({
    control: form.control,
    name: "illnessRecords",
  });

  const { fields: familyHistoryFields, append: appendFamilyHistory, remove: removeFamilyHistory } = useFieldArray({
    control: form.control,
    name: "medicalInfo.familyHistory",
  });

  async function onSubmit(data: ProfileFormValues) {
    if (!auth.currentUser) {
        toast({
            title: "Error",
            description: "You must be logged in to save your profile.",
            variant: "destructive"
        });
        return;
    }
    setIsSaving(true);
    try {
        await updateUserProfile(auth.currentUser.uid, data as HealthProfile);
        toast({
          title: "Profile Saved!",
          description: "Your health information has been successfully updated.",
        });
        router.push('/dashboard');
    } catch (error) {
        console.error("Profile update error:", error);
        toast({
            title: "Save Failed",
            description: "Could not save your profile. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-auto md:grid-cols-7 md:h-10">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="illnesses">Illnesses</TabsTrigger>
                <TabsTrigger value="family">Family History</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="records">Records</TabsTrigger>
                <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-6 space-y-6">
                 <SectionCard title="Personal Information">
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="personalInfo.name" render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="personalInfo.age" render={({ field }) => (
                        <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="personalInfo.gender" render={({ field }) => (
                        <FormItem><FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                            </Select>
                        <FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="personalInfo.contact" render={({ field }) => (
                        <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="personalInfo.email" render={({ field }) => (
                          <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="personalInfo.dateOfBirth" render={({ field }) => (
                        <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="personalInfo.nationality" render={({ field }) => (
                        <FormItem><FormLabel>Nationality</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="md:col-span-2">
                        <FormField control={form.control} name="personalInfo.address" render={({ field }) => (
                        <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        </div>
                    </div>
                </SectionCard>
                 <SectionCard title="Emergency Contact">
                    <div className="grid md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="personalInfo.emergencyContactName" render={({ field }) => (
                            <FormItem><FormLabel>Contact Name</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="personalInfo.emergencyContactPhone" render={({ field }) => (
                            <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="personalInfo.emergencyContactRelationship" render={({ field }) => (
                            <FormItem><FormLabel>Relationship</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                 </SectionCard>
            </TabsContent>

            <TabsContent value="history" className="mt-6 space-y-6">
                <SectionCard title="Birth History">
                     <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="birthHistory.birthWeight" render={({ field }) => (
                        <FormItem><FormLabel>Birth Weight (kg)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="birthHistory.birthLength" render={({ field }) => (
                        <FormItem><FormLabel>Birth Length (cm)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="birthHistory.gestationalAge" render={({ field }) => (
                        <FormItem><FormLabel>Gestational Age (weeks)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="birthHistory.deliveryType" render={({ field }) => (
                        <FormItem><FormLabel>Type of Delivery</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select delivery type" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Vaginal">Vaginal</SelectItem>
                                <SelectItem value="C-Section">C-Section</SelectItem>
                                <SelectItem value="VBAC">VBAC</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                            </Select>
                        <FormMessage /></FormItem>
                        )} />
                        <div className="md:col-span-2">
                        <FormField control={form.control} name="birthHistory.birthComplications" render={({ field }) => (
                        <FormItem><FormLabel>Birth Complications</FormLabel><FormControl><Textarea {...field} placeholder="Any complications during birth..." value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                        )} />
                        </div>
                    </div>
                </SectionCard>
                <SectionCard title="Childhood Illnesses">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="childhoodIllnesses.chickenpox" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Chickenpox</FormLabel></div></FormItem>
                            )} />
                            <FormField control={form.control} name="childhoodIllnesses.measles" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Measles</FormLabel></div></FormItem>
                            )} />
                            <FormField control={form.control} name="childhoodIllnesses.mumps" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Mumps</FormLabel></div></FormItem>
                            )} />
                            <FormField control={form.control} name="childhoodIllnesses.rubella" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Rubella</FormLabel></div></FormItem>
                            )} />
                            <FormField control={form.control} name="childhoodIllnesses.whoopingCough" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Whooping Cough</FormLabel></div></FormItem>
                            )} />
                            <FormField control={form.control} name="childhoodIllnesses.scarletFever" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Scarlet Fever</FormLabel></div></FormItem>
                            )} />
                        </div>
                        <div className="pt-2">
                            <FormField control={form.control} name="childhoodIllnesses.otherChildhoodIllnesses" render={({ field }) => (
                                <FormItem><FormLabel>Other Illnesses</FormLabel><FormControl><Textarea {...field} placeholder="List any other significant childhood illnesses..." value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </div>
                </SectionCard>
            </TabsContent>
            
            <TabsContent value="illnesses" className="mt-6">
                <SectionCard title="Illness Records">
                    <div className="space-y-6">
                        {illnessFields.map((field, index) => (
                            <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name={`illnessRecords.${index}.illnessName`} render={({ field }) => (
                                        <FormItem><FormLabel>Illness Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`illnessRecords.${index}.diagnosisDate`} render={({ field }) => (
                                        <FormItem><FormLabel>Diagnosis Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <div className="md:col-span-2">
                                        <FormField control={form.control} name={`illnessRecords.${index}.symptoms`} render={({ field }) => (
                                            <FormItem><FormLabel>Symptoms</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <FormField control={form.control} name={`illnessRecords.${index}.treatment`} render={({ field }) => (
                                            <FormItem><FormLabel>Treatment</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name={`illnessRecords.${index}.physician`} render={({ field }) => (
                                        <FormItem><FormLabel>Physician</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`illnessRecords.${index}.status`} render={({ field }) => (
                                    <FormItem><FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                                            <SelectItem value="Resolved">Resolved</SelectItem>
                                        </SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                    )} />
                                </div>
                                <Button type="button" variant="destructive" size="sm" onClick={() => removeIllness(index)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove Illness
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => appendIllness({ illnessName: '', diagnosisDate: '', symptoms: '', treatment: '', status: '', physician: '' })}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Illness Record
                        </Button>
                    </div>
                </SectionCard>
            </TabsContent>
            
            <TabsContent value="family" className="mt-6">
                <SectionCard title="Family History">
                    <div className="space-y-6">
                        {familyHistoryFields.map((field, index) => (
                             <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <FormField control={form.control} name={`medicalInfo.familyHistory.${index}.relation`} render={({ field }) => (
                                    <FormItem><FormLabel>Relation</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select relation" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Father">Father</SelectItem>
                                            <SelectItem value="Mother">Mother</SelectItem>
                                            <SelectItem value="Sibling">Sibling</SelectItem>
                                            <SelectItem value="Grandparent">Grandparent</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                    )} />
                                     <FormField control={form.control} name={`medicalInfo.familyHistory.${index}.condition`} render={({ field }) => (
                                        <FormItem><FormLabel>Medical Condition</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`medicalInfo.familyHistory.${index}.ageOfOnset`} render={({ field }) => (
                                        <FormItem><FormLabel>Age of Onset</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <Button type="button" variant="destructive" size="sm" onClick={() => removeFamilyHistory(index)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove Record
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => appendFamilyHistory({ relation: '', condition: '', ageOfOnset: null })}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Family History Record
                        </Button>
                    </div>
                </SectionCard>
            </TabsContent>

            <TabsContent value="medical" className="mt-6">
                <SectionCard title="Medical Information">
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="medicalInfo.bloodGroup" render={({ field }) => (
                        <FormItem><FormLabel>Blood Group</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                            </SelectContent>
                            </Select>
                        <FormMessage /></FormItem>
                        )} />
                        <div className="md:col-span-2">
                            <FormField control={form.control} name="medicalInfo.allergies" render={({ field }) => (
                            <FormItem><FormLabel>Allergies</FormLabel><FormControl><Textarea {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value} onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))} placeholder="e.g., Peanuts, Pollen" /></FormControl><FormDescription>Separate multiple allergies with a comma.</FormDescription><FormMessage /></FormItem>
                            )} />
                        </div>
                    </div>
                </SectionCard>
            </TabsContent>

             <TabsContent value="records" className="mt-6">
                 <SectionCard title="Medical Records">
                    <div className="space-y-6">
                        <FormField control={form.control} name="records.prescriptions" render={({ field }) => (
                        <FormItem><FormLabel>Prescriptions</FormLabel><FormControl><Textarea {...field} rows={5} placeholder="List current and past prescriptions..." value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="records.labReports" render={({ field }) => (
                        <FormItem><FormLabel>Lab Reports</FormLabel><FormControl><Textarea {...field} rows={5} placeholder="Summarize key lab results..." value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="records.vaccinationRecords" render={({ field }) => (
                        <FormItem><FormLabel>Vaccination Records</FormLabel><FormControl><Textarea {...field} rows={5} placeholder="List all vaccinations and dates..." value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                 </SectionCard>
            </TabsContent>

             <TabsContent value="lifestyle" className="mt-6">
                <SectionCard title="Lifestyle">
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormField control={form.control} name="lifestyle.alcoholConsumption" render={({ field }) => (
                            <FormItem><FormLabel>Alcohol Consumption</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="None">None</SelectItem>
                                    <SelectItem value="Socially">Socially</SelectItem>
                                    <SelectItem value="Moderately">Moderately</SelectItem>
                                    <SelectItem value="Heavily">Heavily</SelectItem>
                                </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="lifestyle.smokingStatus" render={({ field }) => (
                            <FormItem><FormLabel>Smoking Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Never">Never</SelectItem>
                                    <SelectItem value="Former">Former</SelectItem>
                                    <SelectItem value="Current">Current</SelectItem>
                                </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="lifestyle.recreationalDrugUse" render={({ field }) => (
                            <FormItem><FormLabel>Recreational Drug Use</FormLabel><FormControl><Input {...field} placeholder="e.g., None, Occasional marijuana" value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="lifestyle.diet" render={({ field }) => (
                        <FormItem><FormLabel>Dietary Information</FormLabel><FormControl><Textarea {...field} placeholder="e.g., Vegetarian, low-sodium..." value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="lifestyle.exercise" render={({ field }) => (
                        <FormItem><FormLabel>Exercise Routine</FormLabel><FormControl><Textarea {...field} placeholder="e.g., Gym 3x a week, daily walks..." value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="lifestyle.habits" render={({ field }) => (
                        <FormItem><FormLabel>Other Habits</FormLabel><FormControl><Textarea {...field} placeholder="e.g., Non-smoker, social drinker..." value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </SectionCard>
            </TabsContent>

        </Tabs>

        <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
                <><Save className="mr-2 h-4 w-4" /> Save Profile</>
            )}
        </Button>
      </form>
    </Form>
  );
}
