// Plik: components/AddMovieForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useNotification } from '@/context/NotificationContext';

interface Props {
  onSuccess: () => void;
}

export default function AddMovieForm({ onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, year }),
      });

      if (!res.ok) throw new Error('Błąd zapisu');

      showNotification({ ok: true, status: 201, url: 'POST /api/movies', message: 'Film dodany' });
      setTitle('');
      setYear('');
      onSuccess();
    } catch (err) {
      showNotification({ ok: false, status: 500, url: 'POST /api/movies', message: 'Błąd' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 flex gap-4 items-end">
      <div className="flex-1">
        <label className="block text-sm text-gray-400 mb-1">Tytuł filmu</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white outline-none focus:border-accent"
          required
        />
      </div>
      <div className="w-32">
        <label className="block text-sm text-gray-400 mb-1">Rok</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white outline-none focus:border-accent"
          required
        />
      </div>
      <button 
        disabled={loading}
        className="bg-accent hover:bg-accent-light px-6 py-2 rounded text-white font-bold transition-colors disabled:opacity-50"
      >
        Dodaj
      </button>
    </form>
  );
}