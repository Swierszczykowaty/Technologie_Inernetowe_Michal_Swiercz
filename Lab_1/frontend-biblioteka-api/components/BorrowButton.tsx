// 'use client' zamienia ten komponent w komponent kliencki
'use client'; 

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Definiujemy typy dla propsów tego komponentu
interface BorrowButtonProps {
  bookId: number;
  isAvailable: boolean;
}

export default function BorrowButton({ bookId, isAvailable }: BorrowButtonProps) {
  const router = useRouter(); // Hook do odświeżania strony
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBorrow = async () => {
    // TODO: Na razie ID członka jest na stałe (np. 1).
    // W pełnej aplikacji pobrałbyś to z logowania.
    const memberId = 1; 

    if (!isAvailable) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3000/api/loans/borrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_id: memberId,
          book_id: bookId,
        }),
      });

      // Oczekujemy odpowiedzi z API, która może zawierać błąd
      const data: { error?: string } = await res.json();

      if (!res.ok) {
        // Przekaż błąd z API (np. "Brak dostępnych egzemplarzy")
        throw new Error(data.error || 'Błąd serwera');
      }

      // Sukces!
      alert('Książka wypożyczona!');

      // Kluczowy moment:
      // Odśwież dane na stronie, aby zaktualizować listę
      router.refresh(); 

    } catch (err) {
      // err jest typu 'unknown', więc sprawdzamy czy to Error
      let errorMessage = 'Wystąpił nieznany błąd.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      console.error(err);
      setError(errorMessage);
      alert(`Nie udało się wypożyczyć: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleBorrow}
      className={`px-4 py-2 rounded-md font-medium text-white
        ${isAvailable
          ? 'bg-accent hover:bg-accent-dark' // Nasz fiolet
          : 'bg-gray-400 cursor-not-allowed'
        }
        transition-colors
        ${isLoading ? 'opacity-50 animate-pulse' : ''}
      `}
      disabled={!isAvailable || isLoading}
    >
      {isLoading ? 'Przetwarzanie...' : 'Wypożycz'}
    </button>
  );
}