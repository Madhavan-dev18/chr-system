import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hospital } from "lucide-react";

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/50 p-4">
      <div className="absolute top-8 flex items-center gap-2">
        <Hospital className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold font-headline">MediSafe</span>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
