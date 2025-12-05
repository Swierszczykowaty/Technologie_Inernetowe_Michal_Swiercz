import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');

    const whereCondition = yearParam ? { year: Number(yearParam) } : {};

    const movies = await prisma.movie.findMany({
      where: whereCondition,
      include: {
        ratings: true, 
      },
    });

    const moviesWithStats = movies.map((movie) => {
      const totalScore = movie.ratings.reduce((sum, r) => sum + r.score, 0);
      const count = movie.ratings.length;
      const avg = count > 0 ? totalScore / count : 0;

      return {
        id: movie.id,
        title: movie.title,
        year: movie.year,
        avg_score: Number(avg.toFixed(2)),
        votes: count,
      };
    });

    moviesWithStats.sort((a, b) => b.avg_score - a.avg_score);

    return NextResponse.json(moviesWithStats);
  } catch (error) {
    return NextResponse.json({ error: 'Błąd pobierania filmów' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, year } = body;

    if (!title || !year) {
      return NextResponse.json({ error: 'Brak tytułu lub roku' }, { status: 400 });
    }

    const movie = await prisma.movie.create({
      data: {
        title,
        year: Number(year),
      },
    });

    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Błąd tworzenia filmu' }, { status: 500 });
  }
}