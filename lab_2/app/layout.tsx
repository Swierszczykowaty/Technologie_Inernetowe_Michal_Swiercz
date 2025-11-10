import './globals.css';
import { Inter } from 'next/font/google';
import { NotificationProvider } from '@/context/NotificationContext';
import NotificationDisplay from '@/components/NotificationDisplay';
import { CartProvider } from '@/context/CartContext'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Lab 2 - Sklep',
  description: 'Implementacja koszyka i zamówień',
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
          <CartProvider> 
            <header className="bg-gray-800 p-4 shadow-md">
              <div className="container mx-auto flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold text-accent-light">
                    Sklep Internetowy
                  </h1>
                  <h2 className='text-sm text-accent-light'>by Michał Świercz</h2>
                </div>
              </div>
            </header>

            <main className="container mx-auto p-8">
              {children}
            </main>

            <NotificationDisplay />
          </CartProvider> 
        </NotificationProvider>
      </body>
    </html>
  );
}