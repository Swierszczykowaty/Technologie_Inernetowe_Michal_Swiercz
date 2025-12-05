'use client';

import { useState, useEffect } from 'react';
import { useNotification } from '@/context/NotificationContext';

interface MovieStat {
  id: string;
  title: string;
  year: number;
  avg_score: number;
  votes: number;
}

interface Props {
  refreshKey: number;
  onRate: () => void;
}

export default function MovieList({ refreshKey, onRate }: Props) {
  const [movies, setMovies] = useState<MovieStat[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Pobieramy wszystkie filmy do głównego rankingu
        const res = await fetch('/api/movies');
        const data = await res.json();
        setMovies(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [refreshKey]);

  const handleRate = async (movieId: string, score: number) => {
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movie_id: movieId, score }),
      });

      if (!res.ok) throw new Error('Błąd oceny');

      showNotification({ ok: true, status: 201, url: 'POST /api/ratings', message: `Oceniono na ${score}` });
      onRate(); 
    } catch (err) {
      showNotification({ ok: false, status: 500, url: 'POST /api/ratings', message: 'Błąd' });
    }
  };

  if (loading) return <p>Ładowanie rankingu...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-accent-light mb-4">Ranking Filmów</h2>
      
      {movies.length === 0 && <p className="text-gray-500">Brak filmów. Dodaj pierwszy!</p>}

      {movies.map((movie, index) => (
        <div key={movie.id} className="bg-gray-800 border border-gray-700 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {/* Miejsce w rankingu */}
              <span className={`text-3xl font-bold w-12 text-center ${index < 3 ? 'text-yellow-500' : 'text-gray-600'}`}>
                #{index + 1}
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">{movie.title} <span className="text-gray-400 font-normal">({movie.year})</span></h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-yellow-400 font-bold text-lg">★ {movie.avg_score.toFixed(2)}</span>
                  <span className="text-gray-500 text-sm">({movie.votes} głosów)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-gray-900 p-2 rounded-lg">
            <span className="text-xs text-gray-400 mr-2 uppercase font-bold tracking-wider">Oceń:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(movie.id, star)}
                className="w-8 h-8 rounded-full bg-gray-700 hover:bg-yellow-600 text-gray-300 hover:text-white font-bold transition-all flex items-center justify-center"
              >
                {star}
              </button>
            ))}
          </div>

        </div>
      ))}
    </div>
  );
}