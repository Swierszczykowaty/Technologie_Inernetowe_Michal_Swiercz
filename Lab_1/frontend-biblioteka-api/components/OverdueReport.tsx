"use client";

import { useState, useEffect } from 'react';

type OverdueItem = {
  loan_id: number;
  member: { id: number; name: string; email: string };
  book: { id: number; title: string };
  loan_date: string;
  due_date: string;
  days_overdue: number;
};

export default function OverdueReport() {
  const [data, setData] = useState<OverdueItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
  const res = await fetch(`http://localhost:3000/api/reports/overdue`);
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || `Błąd serwera (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
      <div className="flex items-center justify-end mb-3">
          <div className="flex items-center space-x-2"> 
          </div>
      </div>

      {error && <div className="text-red-400 mb-2">Błąd: {error}</div>}

      <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Książka</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Czytelnik</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Data wyp.</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Termin zwrotu</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Dni opóźnienia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data && data.length > 0 ? (
              data.map(item => (
                <tr key={item.loan_id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{item.loan_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.book.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.member.name}<div className="text-xs text-gray-400">{item.member.email}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(item.loan_date).toLocaleDateString('pl-PL')}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-red-500">{new Date(item.due_date).toLocaleDateString('pl-PL')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">{item.days_overdue}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Brak zaległych wypożyczeń.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

