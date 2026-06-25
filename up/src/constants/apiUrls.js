const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const apiUrls = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    refreshToken: `${API_BASE_URL}/auth/refresh`
  },
  courses: {
    list: `${API_BASE_URL}/courses`,
    details: (id) => `${API_BASE_URL}/courses/${id}`,
    categories: `${API_BASE_URL}/courses/categories`,
    search: `${API_BASE_URL}/courses/search`
  },
  users: {
    list: `${API_BASE_URL}/admin/users`,
    update: (id) => `${API_BASE_URL}/admin/users/${id}`,
    delete: (id) => `${API_BASE_URL}/admin/users/${id}`
  }
}