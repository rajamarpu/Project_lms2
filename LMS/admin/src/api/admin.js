import { apiRequest } from './config';

// Admin Dashboard Stats
export const getAdminStats = async () => {
  try {
    const response = await apiRequest('/admin/stats');
    return response;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// Admin Profile
export const getAdminProfile = async () => {
  try {
    const response = await apiRequest('/admin/profile');
    return response;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    throw error;
  }
};

// Admin Login — use central auth/login endpoint to obtain JWT
export const adminLogin = async (email, password) => {
  try {
    console.log('[API] adminLogin request:', { email });
    const response = await apiRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    console.log('[API] adminLogin response:', response);

    if (response.token) {
      localStorage.setItem('adminToken', response.token);
    }

    return response;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Admin Register
export const adminRegister = async (data) => {
  try {
    const response = await apiRequest('/auth/admin/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      localStorage.setItem('adminToken', response.token);
    }
    
    return response;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

// Update Admin Profile
export const updateAdminProfile = async (data) => {
  try {
    const response = await apiRequest('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Admin users management
export const getAdminUsers = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/admin/users${queryString ? `?${queryString}` : ''}`);
    return response;
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
};

export const updateAdminUser = async (userId, data) => {
  try {
    const response = await apiRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error updating admin user:', error);
    throw error;
  }
};

export const deleteAdminUser = async (userId) => {
  try {
    const response = await apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting admin user:', error);
    throw error;
  }
};

// Admin course management
export const getAdminCourses = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/admin/courses${queryString ? `?${queryString}` : ''}`);
    return response;
  } catch (error) {
    console.error('Error fetching admin courses:', error);
    throw error;
  }
};

export const updateAdminCourse = async (courseId, data) => {
  try {
    const response = await apiRequest(`/admin/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error updating admin course:', error);
    throw error;
  }
};

export const deleteAdminCourse = async (courseId) => {
  try {
    const response = await apiRequest(`/admin/courses/${courseId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting admin course:', error);
    throw error;
  }
};

export default {
  getAdminStats,
  getAdminProfile,
  adminLogin,
  adminRegister,
  updateAdminProfile,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  getAdminCourses,
  updateAdminCourse,
  deleteAdminCourse,
};
