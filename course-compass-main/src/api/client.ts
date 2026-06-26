import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original?._retried || original?.url?.includes('/auth/refresh') || original?.url?.includes('/auth/login') || original?.url?.includes('/auth/register')) {
      if (!error.response) {
        return Promise.reject({ response: { status: 0, data: { error: 'Network error. Please check your connection.' } } });
      }
      if (!error.response.data) {
        return Promise.reject({ response: { status: error.response.status, data: { error: `Request failed with status ${error.response.status}` } } });
      }
      return Promise.reject(error);
    }
    original._retried = true;
    try {
      refreshPromise ||= API.post('/auth/refresh').then(({ data }) => {
        localStorage.setItem('lms_token', data.token);
        return data.token as string;
      }).finally(() => { refreshPromise = null; });
      const token = await refreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return API(original);
    } catch (refreshError) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      return Promise.reject(refreshError);
    }
  }
);

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("lms_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
