'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { Product } from '@prisma/client';
import { useNotification } from '@/context/NotificationContext';

interface ProductAdminTableProps {
  refetchKey: number;
  onProductDeleted: () => void;
}

interface EditableProduct extends Product {
  isEditing?: boolean;
  editName?: string;
  editPrice?: number | string;
}

export default function ProductAdminTable({ refetchKey, onProductDeleted }: ProductAdminTableProps) {
  const [products, setProducts] = useState<EditableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Nie udało się pobrać produktów');
      const data: Product[] = await res.json();
      setProducts(data.map(p => ({ ...p, isEditing: false, editName: p.name, editPrice: p.price })));
    } catch (err) {
      showNotification({ ok: false, status: 500, url: 'GET /api/products', message: err instanceof Error ? err.message : 'Błąd' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [refetchKey]);

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten produkt?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = res.status === 204 ? {} : await res.json();

      showNotification({
        ok: res.ok,
        status: res.status,
        url: `DELETE /api/products/${id}`,
        message: res.ok ? 'Produkt usunięty' : (data.error || 'Błąd serwera'),
      });

      if (res.ok) {
        fetchProducts();
        onProductDeleted();
      }
    } catch (err) {
      showNotification({ ok: false, status: 500, url: `DELETE /api/products/${id}`, message: err instanceof Error ? err.message : 'Błąd' });
    }
  };

  const toggleEdit = (id: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, isEditing: !p.isEditing, editName: p.name, editPrice: p.price } : { ...p, isEditing: false }
    ));
  };

  const handleEditChange = (id: string, field: 'editName' | 'editPrice', value: string | number) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSave = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const priceNumber = typeof product.editPrice === 'string' ? parseFloat(product.editPrice) : product.editPrice;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: product.editName, price: priceNumber }),
      });
      
      const data = await res.json();

      showNotification({
        ok: res.ok,
        status: res.status,
        url: `PATCH /api/products/${id}`,
        message: res.ok ? 'Zaktualizowano' : (data.error || 'Błąd'),
      });

      if (res.ok) {
        fetchProducts();
      } else {
        toggleEdit(id);
      }
    } catch (err) {
      showNotification({ ok: false, status: 500, url: `PATCH /api/products/${id}`, message: err instanceof Error ? err.message : 'Błąd' });
    }
  };

  if (loading) return <p>Ładowanie tabeli produktów...</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nazwa</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cena</th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Akcje</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {products.length > 0 ? (
            products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-750">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{p.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {p.isEditing ? (
                    <input type="text" value={p.editName} onChange={(e) => handleEditChange(p.id, 'editName', e.target.value)}
                      className="px-2 py-1 border border-gray-600 rounded-md bg-gray-700 text-white"
                    />
                  ) : (
                    p.name
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {p.isEditing ? (
                    <input type="number" value={p.editPrice} onChange={(e) => handleEditChange(p.id, 'editPrice', e.target.value)}
                      className="w-24 px-2 py-1 border border-gray-600 rounded-md bg-gray-700 text-white"
                      min="0" step="0.01"
                    />
                  ) : (
                    `${p.price.toFixed(2)} PLN`
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {p.isEditing ? (
                    <>
                      <button onClick={() => handleSave(p.id)} className="text-green-400 hover:text-green-300">Zapisz</button>
                      <button onClick={() => toggleEdit(p.id)} className="text-gray-400 hover:text-gray-300">Anuluj</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => toggleEdit(p.id)} className="text-accent-light hover:text-accent">Edytuj</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300">Usuń</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                Brak produktów w bazie.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}