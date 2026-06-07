// src/app/api/axiosClient.js (or wherever you setup axios)
import axios from "axios";

const client = axios.create({
  baseURL: "/api",
});

// Interceptor for access token refresh
client.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // call refresh endpoint
      const refreshRes = await fetch("/auth/refresh", {
        method: "POST",
        credentials: "include", // important for cookie
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        // update access token in sessionStorage
        localStorage.setItem("accessToken", data.accessToken);

        // retry original request
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return client(originalRequest);
      }
    }

    return Promise.reject(err);
  }
);

export default client;
