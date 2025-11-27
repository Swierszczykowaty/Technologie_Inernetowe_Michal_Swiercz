import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post nie znaleziony.' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Błąd GET /api/posts/[id]:', error);
    return NextResponse.json({ error: 'Błąd serwera.' }, { status: 500 });
  }
}