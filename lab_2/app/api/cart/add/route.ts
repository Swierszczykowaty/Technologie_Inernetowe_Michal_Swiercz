import { NextResponse } from 'next/server';
import { getSession, CartItem, SessionData } from '@/lib/session';
import prisma from '@/lib/prisma'; // Potrzebujemy do walidacji produktu

export async function POST(request: Request) {
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

    const productExists = await prisma.product.findUnique({
      where: { id: product_id },
    });
    if (!productExists) {
      return NextResponse.json({ error: 'Produkt nie istnieje.' }, { status: 404 });
    }

    const cart = session.cart || [];
    
    const existingItemIndex = cart.findIndex(item => item.productId === product_id);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].qty = cart[existingItemIndex].qty + qty;
    } else {
      cart.push({ productId: product_id, qty: qty });
    }

    session.cart = cart;

    await session.save();

    return NextResponse.json(session.cart);

  } catch (error: any) {
    if (error.name === 'SyntaxError') {
      return NextResponse.json({ error: 'Niepoprawny format JSON.' }, { status: 400 });
    }
    console.error('Błąd /api/cart/add POST:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera przy dodawaniu do koszyka.' },
      { status: 500 }
    );
  }
}