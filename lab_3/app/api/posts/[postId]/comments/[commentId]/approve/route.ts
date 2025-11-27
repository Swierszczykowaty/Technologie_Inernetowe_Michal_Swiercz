import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;

    await prisma.comment.update({
      where: { id: commentId },
      data: { approved: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Błąd POST approve:', error);
    return NextResponse.json({ error: 'Błąd serwera.' }, { status: 500 });
  }
}