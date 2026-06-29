import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Lock, UserCog, Hospital } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b">
         <div className="flex items-center gap-2" >
          <Hospital className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline text-foreground tracking-tighter">
            MediSafe
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Sign Up</Link>
          </Button>
           <Button variant="outline" asChild>
            <Link href="/admin/login">Admin</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40">
           {heroImage && (
             <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover -z-10 opacity-5"
                data-ai-hint={heroImage.imageHint}
                priority
             />
           )}
          <div className="container mx-auto text-center px-4 md:px-6">
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              MediSafe
            </h1>
            <p className="mt-4 max-w-[700px] mx-auto text-lg md:text-xl text-muted-foreground">
              Your Health, Secured and Simplified. Take control of your medical information with a single, secure digital ID.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/register">Create Your Health ID</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">A New Standard in Health Management</h2>
              <p className="mt-2 text-muted-foreground md:text-lg">All your health information, unified and accessible.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl">Secure Health Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Your sensitive health data is protected, giving you peace of mind. All information is managed with privacy as a top priority.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Key className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl">Instant Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Generate a unique Health ID to access your complete profile anytime, anywhere. Share it with healthcare providers seamlessly.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <UserCog className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-2xl">Admin Oversight</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">A dedicated portal for administrators to manage user records efficiently, ensuring data integrity and providing support.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-background border-t">
        <div className="container mx-auto py-6 text-center text-muted-foreground text-sm">
           <p>&copy; {new Date().getFullYear()} MediSafe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
