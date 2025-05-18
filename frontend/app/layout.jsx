import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GrievEase - Grievance Redressal System',
  description: 'A modern platform for registering and tracking grievances and complaints',
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <main className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1">
              {children}
            </div>
            <Toaster />
            <Footer />
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}