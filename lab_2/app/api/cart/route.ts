import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();

    return NextResponse.json(session.cart || []);

  } catch (error: any) {
    console.error('Błąd /api/cart GET:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera przy pobieraniu koszyka.' },
      { status: 500 }
    );
  }
}