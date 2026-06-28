// API Configuration
// Vite exposes env vars on import.meta.env.VITE_*
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => {
  return localStorage.getItem('adminToken') || localStorage.getItem('token');
};

const parseErrorMessage = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const errorBody = await response.json();
      return errorBody.error || errorBody.message || response.statusText || 'Request failed';
    } catch {
      return response.statusText || 'Request failed';
    }
  }

  try {
    const text = await response.text();
    return text || response.statusText || 'Request failed';
  } catch {
    return response.statusText || 'Request failed';
  }
};

const apiRequest = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // If a 401 occurs for auth endpoints (login/register), don't auto-logout
      // This prevents a background 401 from clearing tokens during an in-progress login request
      if (response.status === 401 && !endpoint.startsWith('/auth')) {
        // Token expired or invalid for protected routes — force logout
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/admin-login';
      }

      throw new Error(await parseErrorMessage(response));
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export { API_BASE_URL, apiRequest };
