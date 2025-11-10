import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Błąd przy pobieraniu produktów:', error);
    return NextResponse.json(
      { error: 'Nie udało się pobrać produktów.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nazwa produktu jest wymagana.' },
        { status: 400 }
      );
    }

    if (price === undefined || typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: 'Cena produktu jest wymagana i musi być >= 0.' },
        { status: 400 }
      );
    }

    // Tworzenie w bazie danych
    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        price: price,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    if (error.name === 'SyntaxError') {
      return NextResponse.json({ error: 'Niepoprawny format JSON.' }, { status: 400 });
    }

    console.error('Błąd przy tworzeniu produktu:', error);
    return NextResponse.json(
      { error: 'Wystąpił wewnętrzny błąd serwera.' },
      { status: 500 }
    );
  }
}