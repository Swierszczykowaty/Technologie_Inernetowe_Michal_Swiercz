import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const pendingComments = await prisma.comment.findMany({
      where: {
        approved: false,
      },
      include: {
        post: {
          select: { title: true },
        },
      },
      orderBy: {
        createdAt: 'asc', 
      },
    });

    return NextResponse.json(pendingComments);
  } catch (error) {
    console.error('Błąd GET /api/comments/pending:', error);
    return NextResponse.json({ error: 'Błąd serwera.' }, { status: 500 });
  }
}