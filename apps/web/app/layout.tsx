import type { Metadata } from 'next';
import './globals.css';
import { TrpcProvider } from '@/components/providers/TRPCProvider';

export const metadata: Metadata = {
  title: { template: '%s | CHR System', default: 'CHR System' },
  description: 'Clinical Health Records — Secure. Compliant. Fast.',
  robots: { index: false, follow: false }, // EHR must never be indexed
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TrpcProvider>{children}</TrpcProvider>
      </body>
    </html>
  );
}
