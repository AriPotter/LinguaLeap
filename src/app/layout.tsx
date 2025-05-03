import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Use a standard Google Font like Inter
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster
import MainLayout from '@/components/layout/main-layout'; // Import MainLayout

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Update CSS variable name
});

// Removed Geist Mono as it's not explicitly needed by the design

export const metadata: Metadata = {
  title: 'LinguaLeap', // Updated App Name
  description: 'Learn languages effectively with LinguaLeap.', // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}> {/* Use updated variable */}
        <MainLayout>{children}</MainLayout>
        <Toaster /> {/* Add Toaster */}
      </body>
    </html>
  );
}
