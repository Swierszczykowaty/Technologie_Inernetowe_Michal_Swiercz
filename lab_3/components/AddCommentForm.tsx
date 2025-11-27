'use client';

import { useState, FormEvent } from 'react';
import { useNotification } from '@/context/NotificationContext';

interface AddCommentFormProps {
  postId: string;
  onCommentAdded: () => void;
}

export default function AddCommentForm({ postId, onCommentAdded }: AddCommentFormProps) {
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, body }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Błąd dodawania komentarza');
      }

      showNotification({
        ok: true,
        status: 201,
        url: 'POST comment',
        message: 'Komentarz dodany! Czeka na zatwierdzenie przez moderatora.',
      });

      setAuthor('');
      setBody('');
      onCommentAdded(); 

    } catch (err) {
      showNotification({
        ok: false,
        status: 500,
        url: 'POST comment',
        message: err instanceof Error ? err.message : 'Błąd',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-gray-800 border border-gray-700 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Dodaj komentarz</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Autor</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-accent focus:border-accent outline-none"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Treść</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-accent focus:border-accent outline-none"
            required
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-accent hover:bg-accent-light text-white font-medium rounded-md transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Wysyłanie...' : 'Wyślij komentarz'}
        </button>
      </form>
    </div>
  );
}