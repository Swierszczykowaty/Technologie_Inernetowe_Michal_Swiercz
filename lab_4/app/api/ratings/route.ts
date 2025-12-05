import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { movie_id, score } = body;

    const scoreInt = Number(score);

    if (!movie_id || isNaN(scoreInt) || scoreInt < 1 || scoreInt > 5) {
      return NextResponse.json({ error: 'Nieprawidłowe dane (ocena musi być 1-5)' }, { status: 400 });
    }

    const rating = await prisma.rating.create({
      data: {
        movieId: movie_id,
        score: scoreInt,
      },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Błąd dodawania oceny' }, { status: 500 });
  }
}