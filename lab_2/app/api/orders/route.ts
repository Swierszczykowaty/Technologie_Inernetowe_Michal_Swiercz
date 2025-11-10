import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            product: true, 
          },
        },
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Błąd przy pobieraniu zamówień:', error);
    return NextResponse.json(
      { error: 'Nie udało się pobrać zamówień.' },
      { status: 500 }
    );
  }
}