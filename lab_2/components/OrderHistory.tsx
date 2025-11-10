'use client';

import { useState, useEffect } from 'react';
import { Product, Order, OrderItem } from '@prisma/client';

type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product | null;
  })[];
};

export default function OrderHistory({ refetchKey }: { refetchKey: number }) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/orders');
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Nie udało się pobrać zamówień');
        }
        const data: OrderWithItems[] = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nieznany błąd');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [refetchKey]);

  const calculateOrderTotal = (items: OrderWithItems['items']) => {
    return items.reduce((acc, item) => acc + item.price * item.qty, 0);
  };

  if (loading) {
    return <p>Ładowanie historii zamówień...</p>;
  }

  if (error) {
    return <p className="text-red-400">Błąd: {error}</p>;
  }

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">ADMIN PANEL | Historia Zamówień<span className="text-accent">.</span></h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">Brak złożonych zamówień.</p>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="border border-gray-700 rounded-lg shadow-md bg-gray-800">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Zamówienie: <span className="text-gray-400 font-mono text-sm">{order.id}</span></h3>
                  <p className="text-sm text-gray-500">
                    Data: {new Date(order.createdAt).toLocaleString('pl-PL')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-accent-light">
                    {calculateOrderTotal(order.items).toFixed(2)} PLN
                  </span>
                </div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {order.items.map(item => (
                    <li key={item.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{item.product?.name || <span className="text-red-400 italic">[Produkt usunięty]</span>}</span>
                        <span className="text-gray-400"> (Ilość: {item.qty})</span>
                      </div>
                      <span className="text-gray-300">
                        Snapshot ceny: {item.price.toFixed(2)} PLN
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}