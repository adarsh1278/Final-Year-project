import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import ClientOnlyNavbar from '@/components/ClientOnlyNavbar';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import I18nProvider from '@/components/I18nProvider';

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
        <I18nProvider>
          <AuthProvider>
            <main className="min-h-screen flex flex-col">
              <ClientOnlyNavbar />
              <div className="flex-1">
                {children}
              </div>
              <Toaster />
              <Footer />
            </main>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}