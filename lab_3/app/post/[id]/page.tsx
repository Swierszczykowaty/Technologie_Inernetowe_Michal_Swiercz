'use client';

import { useState, useEffect, useCallback } from 'react'; 
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AddCommentForm from '@/components/AddCommentForm';

type Post = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

type Comment = {
  id: string;
  postId?: string;
  author: string;
  body: string;
  createdAt: string;
};

export default function PostPage() {
  const params = useParams();
  const postId = params.id as string; // Pobieramy ID z URL

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Klucz do odświeżania komentarzy
  const [refetchCommentsKey, setRefetchCommentsKey] = useState(0);

  // Pobieranie posta
  useEffect(() => {
    if (!postId) return;
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (!res.ok) throw new Error('Nie znaleziono posta');
        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError('Błąd ładowania posta');
      }
    };
    fetchPost();
  }, [postId]);

  // Pobieranie komentarzy
  const fetchComments = useCallback(async () => { // Używamy useCallback
    if (!postId) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [postId]); // Zależność tylko postId

  useEffect(() => {
    fetchComments();
  }, [fetchComments, refetchCommentsKey]); // refetchCommentsKey wywoła ponowne pobranie

  if (loading && !post) return <div className="p-8">Ładowanie...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!post) return <div className="p-8">Post nie istnieje.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Przycisk powrotu */}
      <Link href="/" className="text-gray-400 hover:text-white mb-4 inline-block">
        ← Powrót do listy
      </Link>

      {/* Sekcja Posta */}
      <article className="p-8 border border-gray-700 rounded-lg bg-gray-800 shadow-xl">
        <h1 className="text-4xl font-bold text-accent-light mb-4">{post.title}</h1>
        <div className="text-sm text-gray-400 mb-6 pb-6 border-b border-gray-700">
          Opublikowano: {new Date(post.createdAt).toLocaleString('pl-PL')}
        </div>
        <div className="text-lg leading-relaxed whitespace-pre-wrap">
          {post.body}
        </div>
      </article>

      {/* Sekcja Komentarzy */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Komentarze ({comments.length})</h2>
        
        {comments.length === 0 ? (
          <p className="text-gray-500 italic">Brak zatwierdzonych komentarzy. Bądź pierwszy!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-gray-900/50 border border-gray-700 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-accent">{comment.author}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString('pl-PL')}
                  </span>
                </div>
                <p className="text-gray-300">{comment.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Formularz */}
        <AddCommentForm 
          postId={postId} 
          onCommentAdded={() => setRefetchCommentsKey(k => k + 1)} 
        />
      </section>
    </div>
  );
}