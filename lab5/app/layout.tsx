import './globals.css';
import { Inter } from 'next/font/google';
import { NotificationProvider } from '@/context/NotificationContext';
import NotificationDisplay from '@/components/NotificationDisplay';

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
          <header className="bg-gray-800 p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-accent-light">
                  Lab4
                </h1>
                <h2 className='text-sm text-accent-light'>by Michał Świercz</h2>
              </div>
              <nav>
                {/* Linki nawigacyjne (np. /admin) */}
              </nav>
            </div>
          </header>

          <main className="container mx-auto p-8">
            {children}
          </main>

          <NotificationDisplay />
        </NotificationProvider>
      </body>
    </html>
  );
}