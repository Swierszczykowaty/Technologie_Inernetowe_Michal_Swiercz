// Plik: components/BorrowButton.tsx

'use client';

import { useState } from 'react';

interface BorrowButtonProps {
  bookId: number;
  isAvailable: boolean;
  onSuccess?: () => void;
  onResponse?: (info: { status: number; url: string; ok: boolean; message?: string }) => void;
}

export default function BorrowButton({ bookId, isAvailable, onSuccess, onResponse }: BorrowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBorrow = async () => {
    const memberId = 1;

    // allow attempting borrow even if not available so server can return proper status
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/loans/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: memberId,
          book_id: bookId,
        }),
      });

      let data: any = null;
      try { data = await res.json(); } catch (e) { data = null; }

      // report response to parent (for showing status codes/messages)
      if (onResponse) onResponse({ status: res.status, url: 'POST /api/loans/borrow', ok: res.ok, message: data?.error ?? data?.message ?? (data?.id ? 'OK' : undefined) });

      if (!res.ok) {
        const errMsg = data?.error || data?.message || 'Błąd serwera';
        if (onResponse) onResponse({ status: res.status, url: 'POST /api/loans/borrow', ok: false, message: errMsg });
        return;
      }

      // success
      if (onResponse) onResponse({ status: res.status, url: 'POST /api/loans/borrow', ok: true, message: data?.message ?? 'Wypożyczono' });
      if (onSuccess) onSuccess();

    } catch (err) {
      let errorMessage = 'Wystąpił nieznany błąd.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      console.error(err);
      if (onResponse) onResponse({ status: 0, url: 'POST /api/loans/borrow', ok: false, message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleBorrow}
        className={`px-4 py-2 rounded-md font-medium text-white
          ${isAvailable ? 'bg-accent hover:bg-accent-dark' : 'bg-gray-600 hover:bg-gray-500'}
          transition-colors
          ${isLoading ? 'opacity-50 animate-pulse' : ''}
        `}
      >
        {isLoading ? '...' : 'Wypożycz'}
      </button>
      {/* Errors are reported to the global lastResponse panel via onResponse */}
    </div>
  );
}