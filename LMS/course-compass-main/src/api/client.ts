import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("lms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("lms_token");
      localStorage.removeItem("lms_user");
      window.location.href = "/login";
    }
    
    // Provide more detailed error messages
    if (error.response?.data?.error) {
      return Promise.reject(new Error(error.response.data.error));
    }
    
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return Promise.reject(new Error("Connection refused. Please ensure the backend server is running at http://localhost:5000"));
    }
    
    if (error.message === "Network Error") {
      return Promise.reject(new Error("Network error. Please check your connection."));
    }
    
    return Promise.reject(error);
  }
);

export default API;
