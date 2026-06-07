
// app/api/job-recommendation/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    const base =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL || // ✅ correct key
      'http://localhost:8080';

    // 🔐 Forward Authorization from the client → backend
    const auth = req.headers.get('authorization') ?? undefined;

    // Forward the same FormData; browser sets proper multipart headers
    const upstream = await fetch(`${base}/api/jobs/recommend`, {
      method: 'POST',
      body: form,
      headers: auth ? { Authorization: auth } : undefined,
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
