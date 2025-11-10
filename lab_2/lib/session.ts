
import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface SessionData {
  cart?: CartItem[];
}

export interface CartItem {
  productId: string;
  qty: number;
}

export const sessionOptions = {
  password: process.env.SESSION_PASSWORD as string,
  cookieName: 'lab2-shop-session', 
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  if (!process.env.SESSION_PASSWORD) {
    throw new Error('SESSION_PASSWORD nie jest ustawione w .env');
  }

  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );

  if (!session.cart) {
    session.cart = [];
  }

  return session;
}

export async function sessionMiddleware(request: NextRequest, response: NextResponse) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  return response;
}