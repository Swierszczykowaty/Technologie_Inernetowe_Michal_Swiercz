'use client';

import { useState } from 'react';

interface ReturnButtonProps {
  loanId: number;
  onSuccess?: () => void;
  onResponse?: (info: { status: number; url: string; ok: boolean; message?: string }) => void;
}

export default function ReturnButton({ loanId, onSuccess, onResponse }: ReturnButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleReturn = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/loans/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loan_id: loanId }),
      });

      let data: any = null;
      try { data = await res.json(); } catch (e) { data = null; }

      if (onResponse) onResponse({ status: res.status, url: 'POST /api/loans/return', ok: res.ok, message: data?.error ?? data?.message ?? undefined });

      if (!res.ok) {
        const errMsg = data?.error || 'Błąd podczas zwrotu';
        if (onResponse) onResponse({ status: res.status, url: 'POST /api/loans/return', ok: false, message: errMsg });
        return;
      }

      if (onSuccess) onSuccess();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
      console.error(err);
      if (onResponse) onResponse({ status: 0, url: 'POST /api/loans/return', ok: false, message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleReturn}
        disabled={isLoading}
        className="px-3 py-1 text-sm rounded-md font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:bg-gray-400"
      >
        {isLoading ? '...' : 'Zwróć'}
      </button>
    </div>
  );
}