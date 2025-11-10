import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await request.json();
    const { name, price } = body;

    const updateData: Prisma.ProductUpdateInput = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ error: 'Nazwa jest niepoprawna.' }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return NextResponse.json({ error: 'Cena musi być liczbą >= 0.' }, { status: 400 });
      }
      updateData.price = price;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Brak danych do aktualizacji.' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json(updatedProduct);

  } catch (error: any) {
    if (error.name === 'SyntaxError') {
      return NextResponse.json({ error: 'Niepoprawny format JSON.' }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Produkt nie znaleziony.' }, { status: 404 });
    }
    console.error('Błąd /api/products/[id] PATCH:', error);
    return NextResponse.json({ error: 'Wystąpił wewnętrzny błąd serwera.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    if (!productId) {
      return NextResponse.json({ error: 'Brak productId w URL.' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return new NextResponse(null, { status: 204 }); 

  } catch (error: any) {
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
         return NextResponse.json({ error: 'Produkt nie znaleziony.' }, { status: 404 });
      }
      if (error.code === 'P2003') {
         return NextResponse.json({ error: 'Nie można usunąć produktu, ponieważ jest częścią istniejącego zamówienia.' }, { status: 409 }); 
      }
     }
    console.error('Błąd /api/products/[id] DELETE:', error);
    return NextResponse.json({ error: 'Wystąpił wewnętrzny błąd serwera.' }, { status: 500 });
  }
}