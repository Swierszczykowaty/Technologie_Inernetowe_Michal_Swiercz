// Plik: app/layout.tsx

import './globals.css';
import { Inter } from 'next/font/google';
import UserSelector from '@/components/UserSelector';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Dashboard Biblioteki',
  description: 'Projekt na Technologie Internetowe',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pl">
      <body className={`${inter.className} dark`}>
        <header className="bg-gray-800 p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-accent-light">
                Wypożyczalnia książek 
              </h1>
              <h2 className='ml-2 text-sm text-accent-light'>by Michał Świercz</h2>
            </div>
            <div className="flex items-center">
              <UserSelector />
            </div>
          </div>
        </header>
        <main className="container mx-auto p-8">
          {children}
        </main>
      </body>
    </html>
  );
}