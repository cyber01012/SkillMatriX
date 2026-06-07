
// app/api/job-recommendation/filter/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const recId = searchParams.get('recId');
    const q = searchParams.get('q') || '';
    const sort = searchParams.get('sort') || 'scoreDesc';

    if (!recId) {
      return NextResponse.json({ error: 'recId required' }, { status: 400 });
    }

    const base =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL || // ✅ correct key
      'http://localhost:8080';

    // 🔐 forward Authorization header
    const auth = req.headers.get('authorization') ?? undefined;

    const url = `${base}/api/jobs/filter?recId=${encodeURIComponent(
      recId
    )}&q=${encodeURIComponent(q)}&sort=${encodeURIComponent(sort)}`; // ✅ no &amp;

    const upstream = await fetch(url, {
      method: 'GET',
      headers: auth ? { Authorization: auth } : undefined, // ✅ forward token
      cache: 'no-store',
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
