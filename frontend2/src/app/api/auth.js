
// app/api/auth.js (pure JS)
const BASE_URL =
  (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_BASE_URL) ||
  "http://localhost:8080";


// ✅ headers + keepalive support add kiya
function jsonFetch(path, { method = "GET", body, token, params, headers: extraHeaders, keepalive = false } = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  if (params && typeof params === "object") {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const headers = { "Content-Type": "application/json", ...(extraHeaders || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "omit",
    keepalive, // ✅ ab pass ho raha
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error || data?.message || `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  });
}


export const authApi = {
  // ----- Auth -----
  login: (payload) => jsonFetch("/auth/login", { method: "POST", body: payload }),
  signup: (payload) => jsonFetch("/auth/signup", { method: "POST", body: payload }),

 
  // ✅ Session-Id model
  logout: () => {
    const sessionId = typeof window !== "undefined" ? localStorage.getItem("session_id") : null;
   return jsonFetch("/auth/logout", {
      method: "POST",
      body: {}, // avoid 400 on empty body
      keepalive: true,
      headers: {
        "Session-Id": sessionId || "",
        "User-Agent": typeof navigator !== "undefined" ? navigator.userAgent : "",
      },
    });
  },


  // ----- Forgot Password: Send/Resend -----
  sendOtp: (email) =>
    jsonFetch("/api/otp/forgot-password", {
      method: "POST",
      params: { email }, // @RequestParam
    }),

  resendForgotPassword: (email) =>
    jsonFetch("/api/otp/forgot-password/resend", {
      method: "POST",
      params: { email }, // @RequestParam
    }),

  
  // ----- Forgot Password: Final reset (re-verifies server-side) -----
  resetWithOtp: ({ email, otp, newPassword }) =>
    jsonFetch("/password/forgot", {
      method: "POST",
      body: { email, otp, newPassword }, // @RequestBody
    }),
};



export const oauthApi = {
  startGoogle: () => {
    window.location.href = `${BASE_URL}/auth/google`;
  },
};
