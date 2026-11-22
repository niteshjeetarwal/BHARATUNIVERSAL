import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const expected = process.env.ADMIN_PASSWORD;

    if (!expected) {
      return NextResponse.json(
        { error: 'ADMIN_PASSWORD is not configured on the server.' },
        { status: 500 }
      );
    }

    if (!password || password !== expected) {
      return NextResponse.json({ error: 'Invalid admin password.' }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
}
