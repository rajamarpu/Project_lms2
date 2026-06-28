import { apiRequest } from './config';

// Get all teachers
export const getTeachers = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    // Backend exposes users with role-based filtering: /users?role=instructor
    const response = await apiRequest(`/users${queryString ? `?${queryString}` : ''}${queryString ? `&role=instructor` : `?role=instructor`}`);
    return response;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
};

// Get teacher by ID
export const getTeacherById = async (teacherId) => {
  try {
    const response = await apiRequest(`/users/${teacherId}`);
    return response;
  } catch (error) {
    console.error('Error fetching teacher:', error);
    throw error;
  }
};

// Create teacher
export const createTeacher = async (data) => {
  try {
    // Create a user with instructor role
    const payload = { ...data, role: 'instructor' };
    const response = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response;
  } catch (error) {
    console.error('Error creating teacher:', error);
    throw error;
  }
};

// Update teacher
export const updateTeacher = async (teacherId, data) => {
  try {
    const response = await apiRequest(`/users/${teacherId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error updating teacher:', error);
    throw error;
  }
};

// Delete teacher
export const deleteTeacher = async (teacherId) => {
  try {
    const response = await apiRequest(`/users/${teacherId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting teacher:', error);
    throw error;
  }
};

// Invite teacher
export const inviteTeacher = async (email) => {
  try {
    // If backend supports a dedicated invite route this will work,
    // otherwise create a pending instructor user.
    const response = await apiRequest('/users/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role: 'instructor' }),
    });
    return response;
  } catch (error) {
    console.error('Error inviting teacher:', error);
    throw error;
  }
};

// Get teacher performance analytics
export const getTeacherAnalytics = async (teacherId) => {
  try {
    const response = await apiRequest(`/analytics/teachers/${teacherId}`);
    return response;
  } catch (error) {
    console.error('Error fetching teacher analytics:', error);
    throw error;
  }
};

export default {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  inviteTeacher,
  getTeacherAnalytics,
};
