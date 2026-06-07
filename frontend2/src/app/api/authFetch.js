// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// async function authFetch(path, options = {}) {
//   const { method = "GET", body, params, headers: extraHeaders, keepalive = false } = options;

//   let token = typeof window !== "undefined"
//     ? sessionStorage.getItem("accessToken")
//     : null;

//   const headers = {
//     "Content-Type": "application/json",
//     ...(extraHeaders || {}),
//   };

//   if (token) headers.Authorization = `Bearer ${token}`;

//   const url = new URL(`${BASE_URL}${path}`);
//   if (params && typeof params === "object") {
//     Object.entries(params).forEach(([k, v]) => {
//       if (v != null) url.searchParams.set(k, String(v));
//     });
//   }

//   let res = await fetch(url.toString(), {
//     method,
//     headers,
//     body: body ? JSON.stringify(body) : undefined,
//     credentials: "omit",
//     keepalive,
//   });

//   // 🔁 Refresh flow
//   if (res.status === 401 && typeof window !== "undefined") {
//     try {
//       const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
//         method: "POST",
//         credentials: "include", // 🔥 MUST
//       });

//       if (!refreshRes.ok) throw new Error("Refresh failed");

//       const { accessToken } = await refreshRes.json();
//       if (!accessToken) throw new Error("No access token");

//       sessionStorage.setItem("accessToken", accessToken);

//       headers.Authorization = `Bearer ${accessToken}`;

//       res = await fetch(url.toString(), {
//         method,
//         headers,
//         body: body ? JSON.stringify(body) : undefined,
//         credentials: "omit",
//         keepalive,
//       });
//     } catch (err) {
//       sessionStorage.removeItem("accessToken");
//       window.location.href = "/home";
//       throw err;
//     }
//   }

//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) {
//     const err = new Error(data?.message || `HTTP ${res.status}`);
//     err.status = res.status;
//     err.data = data;
//     throw err;
//   }

//   return data;
// }

// export default authFetch;
