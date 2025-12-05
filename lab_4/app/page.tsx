'use client';

import { useState } from 'react';
import AddMovieForm from '@/components/AddMovieForm';
import MovieList from '@/components/MovieList';
import MovieFilter from '@/components/MovieFilter';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12"> 
      
      <section>
        <h1 className="text-4xl font-bold mb-8 text-white">Baza Filmów<span className="text-accent">.</span></h1>
        <AddMovieForm onSuccess={handleRefresh} />
        <MovieList refreshKey={refreshKey} onRate={handleRefresh} />
      </section>

      <hr className="border-gray-700" />

      <MovieFilter />
      
    </div>
  );
}