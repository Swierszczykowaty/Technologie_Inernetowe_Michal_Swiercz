// Plik: app/layout.tsx

import './globals.css';
import { Inter } from 'next/font/google';

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
      <body className={inter.className}>
        <header className="bg-gray-100 dark:bg-gray-800 p-4 shadow-md">
          <div className="container mx-auto flex items-end">
            <h1 className="text-xl font-bold text-accent-dark dark:text-accent-light">
              Wypożyczalnia książek 
            </h1>
            <h2 className='ml-2 text-sm text-accent-dark dark:text-accent-light'>by Michał Świercz</h2>
          </div>
        </header>
        <main className="container mx-auto p-8">
          {children}
        </main>
      </body>
    </html>
  );
}