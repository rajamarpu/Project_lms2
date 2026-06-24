import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("lms_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Single retry for network-level failures only (no response from server).
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const isNetworkError = !error.response;
    const isTimeout = error.code === "ECONNABORTED";

    if (config && (isNetworkError || isTimeout) && !config._retried) {
      config._retried = true;
      await new Promise((resolve) => setTimeout(resolve, 800));
      return API(config);
    }

    if (error.response?.status === 401) {
      const isAuthRoute = config?.url?.includes("/auth/login");
      if (!isAuthRoute) {
        localStorage.removeItem("lms_admin_token");
        localStorage.removeItem("lms_admin_user");
      }
    }

    return Promise.reject(error);
  }
);

export default API;

export const getApiErrorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Network error — please check your internet connection.";
    if (err.code === "ECONNABORTED") return "Request timed out. Please try again.";
    return err.response.data?.error || err.response.data?.message || fallback;
  }
  return fallback;
};
