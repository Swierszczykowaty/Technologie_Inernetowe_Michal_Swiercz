'use client';

import { useState, FormEvent } from 'react';
import { useNotification } from '@/context/NotificationContext';

interface AddPostFormProps {
  onPostAdded: () => void;
}

export default function AddPostForm({ onPostAdded }: AddPostFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      
      const data = await res.json();

      showNotification({
        ok: res.ok,
        status: res.status,
        url: 'POST /api/posts',
        message: res.ok ? `Post "${data.title}" dodany!` : (data.error || 'Błąd serwera'),
      });

      if (res.ok) {
        setTitle('');
        setBody('');
        onPostAdded();
      }
    } catch (err) {
      showNotification({
        ok: false,
        status: 500,
        url: 'POST /api/posts',
        message: err instanceof Error ? err.message : 'Nieznany błąd',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <h2 className="text-3xl font-bold mb-4">Nowy Post<span className="text-accent">.</span></h2>
      <form onSubmit={handleSubmit} className="p-6 border border-gray-700 rounded-lg shadow-md space-y-4 bg-gray-800">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Tytuł</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-accent focus:border-accent"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium mb-1">Treść</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-accent focus:border-accent"
            required
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full px-4 py-2 rounded-md font-medium bg-gray-700 text-white bg-accent hover:bg-accent-light transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Publikowanie...' : 'Opublikuj Post'}
        </button>
      </form>
    </section>
  );
}