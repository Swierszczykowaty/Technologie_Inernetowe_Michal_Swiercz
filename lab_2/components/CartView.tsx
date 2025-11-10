'use client';

import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';
import { useState, FormEvent } from 'react';

function CartItemRow({ item }: { item: import('@/context/CartContext').CartItemDisplay }) {
  const { updateQty, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQtyChange = async (newQty: number) => {
    if (newQty < 1 || !Number.isInteger(newQty)) return;
    setIsUpdating(true);
    await updateQty(item.id, newQty);
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    await removeFromCart(item.id);
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-700">
      <div>
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-gray-400">
          {item.price.toFixed(2)} PLN
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={item.qty}
          onChange={(e) => handleQtyChange(Number(e.target.value))}
          min="1"
          className="w-16 px-2 py-1 border border-gray-600 rounded-md bg-gray-700 text-white disabled:opacity-50"
          disabled={isUpdating}
        />
        <button 
          onClick={handleRemove} 
          className="px-2 py-1 text-red-400 hover:text-red-300 disabled:opacity-50"
          disabled={isUpdating}
        >
          Usuń
        </button>
      </div>
    </div>
  );
}

interface CartViewProps {
  onCheckoutSuccess: () => void;
}

function CouponForm() {
  const { applyCoupon, removeCoupon, appliedCoupon } = useCart();
  const [code, setCode] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!code) return;
    applyCoupon(code);
    setCode('');
  };

  if (appliedCoupon) {
    return (
      <div className="flex justify-between items-center text-sm">
        <p className="text-green-400">
          Użyto kuponu: {appliedCoupon.code} (-{appliedCoupon.discountPercent}%)
        </p>
        <button onClick={removeCoupon} className="text-red-400 hover:text-red-300">
          Usuń
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Kod kuponu (np. SALE20)"
        className="flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-500 text-sm"
      />
      <button type="submit" className="px-3 py-2 rounded-md font-medium text-white bg-gray-600 hover:bg-gray-500 text-sm">
        Aktywuj
      </button>
    </form>
  );
}

export default function CartView({ onCheckoutSuccess }: CartViewProps) {
  const { cartItems, isLoading, error, clearCart, appliedCoupon } = useCart();
  const { showNotification } = useNotification();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountAmount = appliedCoupon ? (subTotal * (appliedCoupon.discountPercent / 100)) : 0;
  const finalTotal = subTotal - discountAmount;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          couponCode: appliedCoupon?.code
        }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Błąd przy składaniu zamówienia');
      }

      showNotification({
        ok: true,
        status: response.status,
        url: 'POST /api/checkout',
        message: `Zamówienie ${data.order_id} przyjęte! Suma: ${data.finalTotal.toFixed(2)} PLN`,
      });
      
      clearCart();
      onCheckoutSuccess();

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Nieznany błąd';
      showNotification({
        ok: false,
        status: 500,
        url: 'POST /api/checkout',
        message: msg,
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return <p className="text-gray-400">Ładowanie koszyka...</p>;
  }
  if (error) {
    return <p className="text-red-400">Błąd ładowania koszyka.</p>;
  }
  if (cartItems.length === 0) {
    return <p className="text-gray-400">Twój koszyk jest pusty.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {cartItems.map(item => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>

        <CouponForm />

      <div className="pt-4 border-t border-gray-700 space-y-2">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>Suma częściowa:</span>
          <span>{subTotal.toFixed(2)} PLN</span>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between items-center text-sm text-green-400">
            <span>Rabat ({appliedCoupon.code}):</span>
            <span>-{discountAmount.toFixed(2)} PLN</span>
          </div>
        )}
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Do zapłaty:</span>
          <span className="text-accent-light">{finalTotal.toFixed(2)} PLN</span>
        </div>
      </div>

      <button 
        onClick={handleCheckout}
        className="w-full mt-4 px-4 py-3 bg-gray-700 rounded-md font-medium text-white bg-accent hover:bg-accent-light transition-colors disabled:opacity-50 shadow-lg shadow-accent/30 hover:shadow-accent/50"
        disabled={cartItems.length === 0 || isCheckingOut}
      >
        {isCheckingOut ? 'Przetwarzanie...' : 'Złóż zamówienie'}
      </button>
    </div>
  );
}