// @ts-nocheck
"use client"

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { useEffect } from 'react';
import { db } from '@/lib/firebase';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    // This function dynamically imports and enables persistence.
    // It only runs on the client-side, after the component has mounted.
    const enableOfflinePersistence = async () => {
      try {
        const { enablePersistence } = await import('firebase/firestore');
        await enablePersistence(db);
      } catch (err) {
        if (err.code === 'failed-precondition') {
          // This can happen if multiple tabs are open.
          // Persistence will be enabled in one tab, and this is an acceptable state.
          console.warn('Firebase persistence failed to enable: multiple tabs open.');
        } else if (err.code === 'unimplemented') {
          // The current browser does not support all of the features required for persistence.
          console.warn('Firebase persistence is not available in this browser.');
        }
      }
    };

    enableOfflinePersistence();
  }, []); // The empty dependency array ensures this runs only once per client session.

  const metadata: Metadata = {
    title: "MediSafe",
    description: "Your Health, Secured and Simplified.",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn("font-body antialiased min-h-screen bg-background")}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
