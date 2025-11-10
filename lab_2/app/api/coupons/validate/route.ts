import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupons';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Nie podano kodu kuponu.' }, { status: 400 });
    }

    const coupon = validateCoupon(code);

    if (!coupon) {
      return NextResponse.json({ error: 'Niepoprawny kod kuponu.' }, { status: 404 });
    }

    return NextResponse.json(coupon);

  } catch (error) {
    console.error('Błąd /api/coupons/validate:', error);
    return NextResponse.json({ error: 'Błąd serwera.' }, { status: 500 });
  }
}