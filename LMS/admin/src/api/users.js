import { apiRequest } from './config';

// Get all users
export const getUsers = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/users${queryString ? `?${queryString}` : ''}`);
    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await apiRequest(`/users/${userId}`);
    return response;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Create user
export const createUser = async (data) => {
  try {
    const response = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user
export const updateUser = async (userId, data) => {
  try {
    const response = await apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Block/Unblock user
export const toggleUserStatus = async (userId, status) => {
  try {
    const response = await apiRequest(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Search users
export const searchUsers = async (query) => {
  try {
    const response = await apiRequest(`/users/search?q=${encodeURIComponent(query)}`);
    return response;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  searchUsers,
};
