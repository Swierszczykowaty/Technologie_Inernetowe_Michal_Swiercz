'use client';

import { useState, FormEvent } from 'react';
import { useNotification } from '@/context/NotificationContext';

interface AddProductFormProps {
  onProductAdded: () => void;
}

export default function AddProductForm({ onProductAdded }: AddProductFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const priceNumber = parseFloat(price);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: priceNumber }),
      });
      
      const data = await res.json();

      showNotification({
        ok: res.ok,
        status: res.status,
        url: 'POST /api/products',
        message: res.ok ? `Dodano: ${data.name}` : (data.error || 'Błąd serwera'),
      });

      if (res.ok) {
        setName('');
        setPrice('');
        onProductAdded();
      }
    } catch (err) {
      showNotification({
        ok: false,
        status: 500,
        url: 'POST /api/products',
        message: err instanceof Error ? err.message : 'Nieznany błąd',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <h2 className="text-3xl font-bold mb-4">ADMIN PANEL | Zarządzanie Produktami<span className="text-accent">.</span></h2>
      <form onSubmit={handleSubmit} className="p-6 border border-gray-700 rounded-lg shadow-md space-y-4 bg-gray-800">
        <h3 className="text-xl font-semibold mb-2">Dodaj nowy produkt</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Nazwa</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-1">Cena (PLN)</label>
            <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="md:mt-6">
            <button type="submit" disabled={isLoading} className="w-full px-4 py-2 rounded-md font-medium text-white bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50">
              {isLoading ? 'Dodawanie...' : 'Dodaj Produkt'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}