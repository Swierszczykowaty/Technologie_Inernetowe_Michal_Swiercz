import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Biblioteka Lab',
  description: 'Projekt na Technologie Internetowe',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <main className="container mx-auto p-8">
          {children}
        </main>
      </body>
    </html>
  );
}