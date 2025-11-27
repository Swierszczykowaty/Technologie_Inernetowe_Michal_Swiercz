'use client';

import { useState, useEffect } from 'react';
import { useNotification } from '@/context/NotificationContext';

interface PendingComment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  post: {
    title: string;
  };
}

export default function AdminPage() {
  const [comments, setComments] = useState<PendingComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchPendingComments = async () => {
    try {
      const res = await fetch('/api/comments/pending');
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingComments();
  }, []);

  const handleApprove = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/approve`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Błąd zatwierdzania');

      showNotification({
        ok: true,
        status: 200,
        url: 'POST approve',
        message: 'Komentarz zatwierdzony.',
      });

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      showNotification({
        ok: false,
        status: 500,
        url: 'POST approve',
        message: 'Nie udało się zatwierdzić.',
      });
    }
  };

  if (loading) return <div className="p-8">Ładowanie panelu...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Panel Moderatora<span className="text-accent">.</span></h1>

      {comments.length === 0 ? (
        <div className="p-8 border border-green-800 bg-green-900/20 rounded-lg text-center text-green-400">
          Wszystkie komentarze zostały zatwierdzone! 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-6 border border-gray-700 rounded-lg bg-gray-800 shadow-md flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">
                  Post: <span className="text-accent font-medium">{comment.post.title}</span>
                </div>
                <div className="mb-2">
                  <span className="font-bold text-white">{comment.author}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(comment.createdAt).toLocaleString('pl-PL')}
                  </span>
                </div>
                <p className="text-gray-300 p-3 bg-gray-900/50 rounded-md">
                  {comment.body}
                </p>
              </div>
              
              <button
                onClick={() => handleApprove(comment.id)}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-md transition-colors whitespace-nowrap shadow-lg"
              >
                Zatwierdź ✓
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}