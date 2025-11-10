'use client';

import { useEffect, useState, FormEvent } from 'react';
import { Product } from '@prisma/client';
import { useCart } from '@/context/CartContext';
import { useNotification, ApiNotification } from '@/context/NotificationContext';

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (qty < 1) {
      showNotification({
        ok: false,
        status: 400,
        url: 'Local Validation',
        message: 'Ilość musi być większa od 0.'
      });
      return;
    }
    
    setIsAdding(true);
    try {
      await addToCart(product, qty);
      setQty(1); 
    } catch (err) {
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="border border-gray-700 rounded-lg p-6 shadow-md bg-gray-800 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-400 mb-4 text-md font-bold text-accent-light">
          {product.price.toFixed(2)} PLN
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          min="1"
          className="w-20 px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-accent focus:border-accent bg-gray-700 text-white"
          disabled={isAdding}
        />
        <button 
          type="submit" 
          className="flex-1 px-4 py-2 rounded-md font-medium text-white bg-gray-700 hover:bg-gray-600 cursor-pointer transition-colors disabled:opacity-50"
          disabled={isAdding}
        >
          {isAdding ? 'Dodawanie...' : 'Dodaj do koszyka'}
        </button>
      </form>
    </div>
  );
}

export default function ProductList({ refetchKey }: { refetchKey: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Nie udało się pobrać produktów');
        }
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Nieznany błąd';
        setError(msg);
        showNotification({
          ok: false,
          status: 500,
          url: 'GET /api/products',
          message: msg,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [showNotification, refetchKey]);

  if (loading) {
    return <div className="text-center p-4">Ładowanie produktów...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-700 bg-red-100 rounded-md">
      Błąd ładowania produktów: {error}
    </div>;
  }

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">Produkty<span className="text-accent">.</span></h2>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Brak produktów do wyświetlenia.</p>
      )}
    </section>
  );
}