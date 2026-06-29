
"use client"

import { AuthCard } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createUser } from "@/lib/user";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, healthId } = await createUser(email, password, name);
      toast({
        title: "Registration Successful!",
        description: `Your new Health ID is ${healthId}.`,
      });
      router.push('/dashboard');
    } catch (error: any) {
        console.error("Registration error", error);
        let description = "An unknown error occurred. Please try again.";
        if (error.code === 'auth/email-already-in-use') {
            description = "This email address is already in use. Please try logging in.";
        } else if (error.message) {
            description = error.message;
        }
        
        toast({
            title: "Registration Failed",
            description: description,
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create Your Account"
      description="Get your unique Health ID and start managing your health."
    >
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)}/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
