import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    if (!productId) {
      return NextResponse.json({ error: 'Brak productId w URL.' }, { status: 400 });
    }

    const session = await getSession();
    let cart = session.cart || [];

    const itemExists = cart.some(item => item.productId === productId);

    if (!itemExists) {
      return NextResponse.json(cart);
    }

    cart = cart.filter(item => item.productId !== productId);

    session.cart = cart;
    await session.save();

    return NextResponse.json(session.cart);

  } catch (error: any) {
    console.error('Błąd /api/cart/item DELETE:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera przy usuwaniu z koszyka.' },
      { status: 500 }
    );
  }
}