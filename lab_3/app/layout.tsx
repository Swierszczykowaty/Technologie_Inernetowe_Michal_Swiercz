// Plik: app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { NotificationProvider } from '@/context/NotificationContext';
import NotificationDisplay from '@/components/NotificationDisplay';
import Link from 'next/link'; // PAMIĘTAJ O DODANIU IMPORTU

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Lab 3 - Blog',
  description: 'Implementacja bloga z moderacją',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={`${inter.className} dark`}>
        <NotificationProvider>
          <header className="bg-gray-800 p-4 shadow-md mb-8">
            <div className="container mx-auto flex justify-between items-center">
              <div>
                <Link href="/" className="">
                  <h1 className='text-xl font-bold text-accent-light'>Blog (Lab 3)</h1>
                                  <h2 className='text-sm text-accent-light'>by Michał Świercz</h2>

                </Link>
              </div>
              <nav className="flex gap-4">
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Strona główna
                </Link>
                <Link href="/admin" className="text-accent font-medium hover:text-accent-light transition-colors border border-accent px-3 py-1 rounded hover:bg-accent/10">
                  Panel Moderatora
                </Link>
              </nav>
            </div>
          </header>

          <main className="container mx-auto p-4 md:p-8">
            {children}
          </main>

          <NotificationDisplay />
        </NotificationProvider>
      </body>
    </html>
  );
}
