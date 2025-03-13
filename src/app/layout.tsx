import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
// import Footer from '@/components/layout/Foote1r';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'F1 Dashboard',
  description: 'Formula 1 analysis dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <div className="min-h-screen">
          {children}
        </div>
        {/* <Footer /> */}
      </body>
    </html>
  );
}