import type { Metadata } from 'next';
import './globals.css';
import { Suspense } from 'react';
import { AuthProvider } from '../lib/auth';
import { AdminLayout } from '../components/AdminLayout';

export const metadata: Metadata = {
  title: 'Ergocraft Seating — Admin Portal',
  description: 'Catalogue and Order Management for Ergocraft Seating Pvt. Ltd.',
  icons: {
    icon: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FAF8F5]">
        <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5]" />}>
          <AuthProvider>
            <AdminLayout>{children}</AdminLayout>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
