import axios, { AxiosError } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15s — prevents requests hanging forever on a flaky connection
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("lms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// One in-flight retry for network-level failures (no response from server),
// e.g. dropped wifi or a cold server. Does not retry 4xx/5xx responses —
// those are real errors and retrying would just duplicate side effects.
API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as (typeof error.config & { _retried?: boolean }) | undefined;

    const isNetworkError = !error.response;
    const isTimeout = error.code === "ECONNABORTED";

    if (config && (isNetworkError || isTimeout) && !config._retried) {
      config._retried = true;
      await new Promise((resolve) => setTimeout(resolve, 800));
      return API(config);
    }

    // Centralized session-expiry handling: if the token is rejected,
    // clear local auth state so the UI doesn't keep showing a "logged in"
    // shell while every request silently 401s.
    if (error.response?.status === 401) {
      const isAuthRoute = config?.url?.includes("/auth/login") || config?.url?.includes("/auth/register");
      if (!isAuthRoute) {
        localStorage.removeItem("lms_token");
        localStorage.removeItem("lms_user");
      }
    }

    return Promise.reject(error);
  }
);

export default API;

/**
 * Extracts a user-friendly message from any API error shape.
 * Use this in catch blocks instead of reaching into
 * `err.response.data.error` directly everywhere.
 */
export const getApiErrorMessage = (err: unknown, fallback = "Something went wrong. Please try again."): string => {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return "Network error — please check your internet connection.";
    }
    if (err.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    return err.response.data?.error || err.response.data?.message || fallback;
  }
  return fallback;
};
