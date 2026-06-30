import type { Metadata } from 'next';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CHR-System | Clinical Health Records',
  description: 'Production-grade, HIPAA-aligned EHR platform',
};

import { TRPCProvider } from '@/components/providers/TRPCProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground">
        <TRPCProvider>
          {children}
        </TRPCProvider>
      </body>
    </html>
  );
}

