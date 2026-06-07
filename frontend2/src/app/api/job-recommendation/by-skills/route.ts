
// app/api/job-recommendation/by-skills/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const base =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL || // ✅ correct key
      'http://localhost:8080';

    // 🔐 forward Authorization header from client → backend
    const auth = req.headers.get('authorization') ?? undefined;

    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const upstream = await fetch(`${base}/api/jobs/recommend/by-skills`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(auth ? { Authorization: auth } : {}), // ✅ forward token
      },
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        'content-type':
          upstream.headers.get('content-type') || 'application/json',
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
