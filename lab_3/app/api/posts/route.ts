import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Błąd przy pobieraniu postów:', error);
    return NextResponse.json(
      { error: 'Nie udało się pobrać postów.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, body } = data;

    // Walidacjadancyh
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tytuł jest wymagany.' },
        { status: 400 }
      );
    }
    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      return NextResponse.json(
        { error: 'Treść posta jest wymagana.' },
        { status: 400 }
      );
    }

    const newPost = await prisma.post.create({
      data: {
        title: title.trim(),
        body: body.trim(),
      },
    });

    return NextResponse.json(newPost, { status: 201 });

  } catch (error: any) {
    if (error.name === 'SyntaxError') {
      return NextResponse.json({ error: 'Niepoprawny format JSON.' }, { status: 400 });
    }
    console.error('Błąd przy tworzeniu posta:', error);
    return NextResponse.json(
      { error: 'Wystąpił wewnętrzny błąd serwera.' },
      { status: 500 }
    );
  }
}