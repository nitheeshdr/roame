import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider, Toaster } from '@/components/ui';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Roame — Find your people, near you',
  description: 'Discover, create, and join real-world activities happening around you.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
