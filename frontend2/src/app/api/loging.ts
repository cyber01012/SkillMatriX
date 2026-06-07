
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();

  const backend =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  const res = await fetch(`${backend}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  // ✅ Extract token from backend response
  const token = data.token;

  if (!token) {
    return NextResponse.json(
      { error: "Token not returned from backend" },
      { status: 500 }
    );
  }

  // ✅ Set HTTP-only session cookie
  const cookieStore = await cookies();
  cookieStore.set("session_id", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ success: true });
}
``
