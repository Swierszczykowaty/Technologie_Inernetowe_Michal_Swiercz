import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';
import { Prisma, Product } from '@prisma/client';
import { validateCoupon } from '@/lib/coupons';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const cart = session.cart || [];
    const body = await request.json();
    const { couponCode } = body;

    if (cart.length === 0) {
      return NextResponse.json({ error: 'Koszyk jest pusty.' }, { status: 400 });
    }

    const productIds = cart.map(item => item.productId);
    const productsFromDb = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let subTotal = 0;

    interface OrderItemData {
      productId: string;
      qty: number;
      price: number;
    }
    const orderItemsData: OrderItemData[] = [];

    for (const item of cart) {
      // 2. Dodaj jawny typ ': Product'
      const product = productsFromDb.find((p: Product) => p.id === item.productId);
      if (!product) {
        throw new Error(`Produkt o ID ${item.productId} nie został znaleziony.`);
      }
      subTotal += product.price * item.qty;
      orderItemsData.push({
        productId: product.id,
        qty: item.qty,
        price: product.price,
      });
    }

    const coupon = validateCoupon(couponCode || '');
    let discountAmount = 0;
    let finalTotal = subTotal;
    
    if (coupon) {
      discountAmount = subTotal * (coupon.discountPercent / 100);
      finalTotal = subTotal - discountAmount;
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newOrder = await tx.order.create({
        data: {
          subTotal: subTotal,
          discountAmount: discountAmount,
          finalTotal: finalTotal,
          appliedCoupon: coupon ? coupon.code : null,
        },
      });

      await tx.orderItem.createMany({
        data: orderItemsData.map(item => ({
          ...item,
          orderId: newOrder.id,
        })),
      });

      return newOrder;
    });

    session.cart = [];
    await session.save();

    return NextResponse.json(
      { 
        order_id: result.id, 
        total: result.subTotal,
        finalTotal: result.finalTotal,
        discountAmount: result.discountAmount,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Błąd /api/checkout POST:', error);
    return NextResponse.json(
      { error: 'Wystąpił wewnętrzny błąd serwera.' },
      { status: 500 }
    );
  }
}