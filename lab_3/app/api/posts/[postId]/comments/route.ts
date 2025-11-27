import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
        approved: true, 
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Błąd GET comments:', error);
    return NextResponse.json({ error: 'Błąd serwera.' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const body = await request.json();
    const { author, body: content } = body; 

    if (!author || !content) {
      return NextResponse.json({ error: 'Autor i treść są wymagane.' }, { status: 400 });
    }

    const newComment = await prisma.comment.create({
      data: {
        postId: postId,
        author: author,
        body: content,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Błąd POST comment:', error);
    return NextResponse.json({ error: 'Błąd serwera.' }, { status: 500 });
  }
}