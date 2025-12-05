// Plik: components/MovieFilter.tsx
'use client';

import { useState } from 'react';

interface MovieStat {
  id: string;
  title: string;
  year: number;
  avg_score: number;
  votes: number;
}

export default function MovieFilter() {
  const [year, setYear] = useState('');
  const [movies, setMovies] = useState<MovieStat[] | null>(null); // null oznacza "jeszcze nie szukano"
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!year) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/movies?year=${year}`);
      const data = await res.json();
      setMovies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-white">Archiwum (Filtrowanie)<span className="text-accent">.</span></h2>
      
      <form onSubmit={handleSearch} className="flex gap-4 items-end mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Wpisz rok produkcji</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="np. 1999"
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white outline-none focus:border-accent w-40"
          />
        </div>
        <button 
          type="submit"
          disabled={loading || !year}
          className="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded text-white font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Szukanie...' : 'Filtruj'}
        </button>
      </form>

      {/* Wyniki wyszukiwania */}
      {movies !== null && (
        <div className="space-y-2">
          {movies.length === 0 ? (
            <p className="text-gray-400 italic">Brak filmów z roku {year}.</p>
          ) : (
            <div className="grid gap-3">
              {movies.map((movie) => (
                <div key={movie.id} className="flex justify-between items-center bg-gray-900/50 p-3 rounded border border-gray-700">
                  <span className="font-medium text-white">{movie.title}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-yellow-400">★ {movie.avg_score.toFixed(2)}</span>
                    <span className="text-gray-500">{movie.votes} głosów</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}