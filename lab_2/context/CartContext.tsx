// Plik: context/CartContext.tsx
'use client';

import { 
  createContext, 
  useContext, 
  useState, 
  ReactNode, 
  useEffect, 
  useCallback 
} from 'react';
import { useNotification, ApiNotification } from '@/context/NotificationContext';
import { Product } from '@prisma/client';

export interface CartItemDisplay extends Product {
  qty: number;
}
interface ApiCartItem {
  productId: string;
  qty: number;
}
interface AppliedCoupon {
  code: string;
  discountPercent: number;
}

interface CartContextType {
  cartItems: CartItemDisplay[];
  isLoading: boolean;
  error: string | null;
  appliedCoupon: AppliedCoupon | null;
  addToCart: (product: Product, qty: number) => Promise<void>;
  updateQty: (productId: string, newQty: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

async function handleApiResponse(
  response: Response, 
  url: string,
  notificationHook: (data: ApiNotification) => void,
  defaultMessage?: string
): Promise<any> {
  const data = await response.json();
  const okMessage = defaultMessage || 'Operacja koszyka udana';
  
  const notification: ApiNotification = {
    ok: response.ok,
    status: response.status,
    url: url,
    message: response.ok ? okMessage : (data.error || 'Błąd operacji'),
  };
  notificationHook(notification);

  if (!response.ok) {
    throw new Error(data.error || 'Błąd API');
  }
  return data;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItemDisplay[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const { showNotification } = useNotification();

  const mapApiCartToDisplay = useCallback((
    apiCart: ApiCartItem[], 
    products: Product[]
  ): CartItemDisplay[] => {
    return apiCart
      .map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;
        return {
          ...product,
          qty: item.qty,
        };
      })
      .filter((item): item is CartItemDisplay => item !== null);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [cartRes, productsRes] = await Promise.all([
          fetch('/api/cart'),
          fetch('/api/products')
        ]);

        if (!cartRes.ok || !productsRes.ok) {
          throw new Error('Nie udało się pobrać danych koszyka lub produktów');
        }

        const apiCart: ApiCartItem[] = await cartRes.json();
        const products: Product[] = await productsRes.json();
        
        setAllProducts(products);
        setCartItems(mapApiCartToDisplay(apiCart, products));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Nieznany błąd ładowania';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, [mapApiCartToDisplay]);

  const updateCartState = (apiCart: ApiCartItem[]) => {
    setCartItems(mapApiCartToDisplay(apiCart, allProducts));
  };

  const addToCart = async (product: Product, qty: number) => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, qty }),
      });
      const apiCart: ApiCartItem[] = await handleApiResponse(response, 'POST /api/cart/add', showNotification);
      updateCartState(apiCart);
    } catch (err) {
      console.error(err);
    }
  };

  const updateQty = async (productId: string, newQty: number) => {
    try {
      const response = await fetch('/api/cart/item', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, qty: newQty }),
      });
      const apiCart: ApiCartItem[] = await handleApiResponse(response, 'PATCH /api/cart/item', showNotification);
      updateCartState(apiCart);
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const response = await fetch(`/api/cart/item/${productId}`, {
        method: 'DELETE',
      });
      const apiCart: ApiCartItem[] = await handleApiResponse(response, `DELETE /api/cart/item/${productId}`, showNotification);
      updateCartState(apiCart);
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const coupon: AppliedCoupon = await handleApiResponse(
        response, 
        'POST /api/coupons/validate', 
        showNotification,
        `Kupon ${code} aktywowany!`
      );
      setAppliedCoupon(coupon);
    } catch (err) {
      setAppliedCoupon(null);
      console.error(err);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showNotification({
      ok: true,
      status: 200,
      url: 'Local',
      message: 'Kupon usunięty.'
    });
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      isLoading, 
      error, 
      appliedCoupon,
      addToCart, 
      updateQty, 
      removeFromCart,
      clearCart,
      applyCoupon,
      removeCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}