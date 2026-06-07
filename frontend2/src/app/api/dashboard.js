
// src/app/api/dashboard.js
const BASE_URL =
  (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_API_BASE_URL) ||
  "http://localhost:8080";

/** decode JWT payload — client-side only (optional util) */
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function authHeaders(explicitToken) {
  const t =
    explicitToken ??
    (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);

  // NOTE: Content-Type will be set in jsonFetch only for non-FormData bodies
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/**
 * Generic fetch helper
 * - token: optional explicit token (otherwise localStorage is used)
 * - headers: optional extra headers to merge
 * - body: object/string/FormData
 */
async function jsonFetch(
  path,
  { method = "GET", params, body, token, headers: extraHeaders } = {}
) {
  const url = new URL(`${BASE_URL}${path}`);
  if (params && typeof params === "object") {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers = {
    ...authHeaders(token),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(extraHeaders || {}),
  };

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    credentials: "omit",
  });

  const raw = await res.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    const msg = data?.message || data?.error || raw || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data || raw;
    throw err;
  }

  return Object.keys(data || {}).length ? data : raw;
}

export const dashboardApi = {
  // Backend reads user from JWT
  async getSummaryForCurrentUser() {
    const t =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!t) throw new Error("Not authenticated");
    return await jsonFetch(`/api/dashboard/summary`, { method: "GET" });
  },

  // Pick ONE endpoint style; adjust to your backend:
  // If your backend exposes /api/dashboard/activity?limit=50, use that:
  async getActivityMinimal(limit = 50) {
    return await jsonFetch(`/activity/me/minimal`, {
      method: "GET",
      params: { limit },
    });
  },

  // If instead you have /activity/me/minimal?limit=50, switch to:
  // async getActivityMinimal(limit = 50) {
  //   return await jsonFetch(`/activity/me/minimal`, { method: "GET", params: { limit } });
  // },
};

export const profileApi = {
  // ✅ match Spring: PUT /user/profile
  async updateProfile(fields) {
    return await jsonFetch(`/user/profile`, { method: "PUT", body: fields });
  },

  // ✅ match Spring: POST /user/profile-photo (multipart)
  async uploadPhoto(file) {
    const form = new FormData();
    form.append("file", file);
    return await jsonFetch(`/user/profile-photo`, {
      method: "POST",
      body: form, // jsonFetch detects FormData and won't set JSON Content-Type
    });
  },

  // ✅ match Spring: DELETE /user/profile-photo
  async deletePhoto() {
    return await jsonFetch(`/user/profile-photo`, { method: "DELETE" });
  },

  // (optional) read profile if you want to fetch here as well
  async getProfile() {
    return await jsonFetch(`/user/profile`, { method: "GET" });
  },
};

export const passwordApi = {
  /**
   * Logged-in change password
   * Change path to whatever your backend exposes (examples):
   *  - POST /user/change-password
   *  - POST /auth/change-password
   *  - POST /password/change-password
   */
  async changePassword(payload, opts = {}) {
    // Example path — replace if your controller uses a different one
    const path = `/change/change-password`;
    return await jsonFetch(path, { method: "POST", body: payload, ...opts });
  },
};
