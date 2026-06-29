"use client"

import { AuthCard } from "@/components/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <AuthCard
      title="Admin Portal"
      description="Please enter your administrator credentials."
    >
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" placeholder="admin1" required defaultValue="admin1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required defaultValue="@123" />
        </div>
        <Button asChild className="w-full">
          <Link href="/admin/dashboard">Log In</Link>
        </Button>
      </form>
    </AuthCard>
  );
}
