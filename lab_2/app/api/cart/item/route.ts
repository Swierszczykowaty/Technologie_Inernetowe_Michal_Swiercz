
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { product_id, qty } = body;

    if (!product_id || typeof product_id !== 'string') {
      return NextResponse.json({ error: 'Brak lub niepoprawne product_id.' }, { status: 400 });
    }

    if (!qty || typeof qty !== 'number' || qty < 1 || !Number.isInteger(qty)) {
      return NextResponse.json({ error: 'Ilość (qty) musi być liczbą całkowitą >= 1.' }, { status: 400 });
    }

    const cart = session.cart || [];
    const itemIndex = cart.findIndex(item => item.productId === product_id);

    if (itemIndex > -1) {
      cart[itemIndex].qty = qty;
    } else {
      return NextResponse.json(
        { error: 'Produktu nie ma w koszyku. Użyj /api/cart/add, aby go dodać.' },
        { status: 404 }
      );
    }

    session.cart = cart;
    await session.save();

    return NextResponse.json(session.cart);

  } catch (error: any) {
    if (error.name === 'SyntaxError') {
      return NextResponse.json({ error: 'Niepoprawny format JSON.' }, { status: 400 });
    }
    console.error('Błąd /api/cart/item PATCH:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera przy modyfikacji koszyka.' },
      { status: 500 }
    );
  }
}