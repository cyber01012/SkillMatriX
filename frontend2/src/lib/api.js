
// src/lib/api.js
export const API_BASE =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
  "http://localhost:8080";

// Pull token each call (client only)
function authHeaders() {
  const t = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return {
    "Content-Type": "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}

/**
 * apiFetch — Always call backend (8080) unless absolute URL
 * - Adds Authorization header automatically
 * - Throws on non-2xx
 */
export async function apiFetch(path, { method = "GET", headers = {}, body, params } = {}) {
  const url = new URL(path.startsWith("http") ? path : `${API_BASE}${path}`);

  if (params && typeof params === "object") {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const res = await fetch(url.toString(), {
    method,
    headers: { ...authHeaders(), ...headers },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "omit",
  });

  // Try JSON first; if fail, try text
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    const payload = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => "");
    const msg = (isJson ? payload?.message || payload?.error : payload) || `HTTP ${res.status}`;
    // Useful console to diagnose if HTML was returned
    if (!isJson) console.error("Non-JSON error body:", msg.slice(0, 200));
    const err = new Error(msg);
    err.status = res.status;
    err.data = payload;
    throw err;
  }

  return isJson ? res.json() : res.text();
}
