'use client';

import { useState, useEffect } from 'react';
import { Post } from '@prisma/client';
import Link from 'next/link';

interface PostListProps {
  refetchKey: number;
}

export default function PostList({ refetchKey }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/posts');
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Nie udało się pobrać postów');
        }
        const data: Post[] = await res.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nieznany błąd');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [refetchKey]);

  if (loading) {
    return <p>Ładowanie postów...</p>;
  }

  if (error) {
    return <p className="text-red-400">Błąd ładowania: {error}</p>;
  }

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">Ostatnie Posty<span className="text-accent">.</span></h2>
      {posts.length === 0 ? (
        <p className="text-gray-500">Brak postów do wyświetlenia.</p>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <article key={post.id} className="p-6 border border-gray-700 rounded-lg shadow-md bg-gray-800">
              <Link href={`/post/${post.id}`} className="hover:underline">
                <h3 className="text-2xl font-semibold text-accent-light mb-2">{post.title}</h3>
              </Link>
              <p className="text-sm text-gray-400 mb-4">
                Opublikowano: {new Date(post.createdAt).toLocaleString('pl-PL')}
              </p>
              <p className="text-gray-300 truncate">
                {post.body}
              </p>
              <Link href={`/post/${post.id}`} className="inline-block mt-4 font-medium text-accent hover:text-accent-light transition-colors">
                Czytaj dalej i zobacz komentarze →
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}