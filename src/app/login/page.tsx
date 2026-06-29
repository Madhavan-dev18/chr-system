"use client"

import { AuthCard } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState('john.doe@example.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful!",
        description: "Redirecting to your dashboard...",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Login error", error);
      toast({
        title: "Login Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthCard
      title="User Login"
      description="Access your secure health profile."
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging In..." : "Log In"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
