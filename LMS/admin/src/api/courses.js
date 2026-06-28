import { apiRequest } from './config';

// Get all courses
export const getCourses = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/courses${queryString ? `?${queryString}` : ''}`);
    return response;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Get course by ID
export const getCourseById = async (courseId) => {
  try {
    const response = await apiRequest(`/courses/${courseId}`);
    return response;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

// Create course
export const createCourse = async (data) => {
  try {
    const response = await apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Update course
export const updateCourse = async (courseId, data) => {
  try {
    const response = await apiRequest(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// Delete course
export const deleteCourse = async (courseId) => {
  try {
    const response = await apiRequest(`/courses/${courseId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Get course statistics
export const getCourseStats = async (courseId) => {
  try {
    const response = await apiRequest(`/courses/${courseId}/stats`);
    return response;
  } catch (error) {
    console.error('Error fetching course stats:', error);
    throw error;
  }
};

// Upload course thumbnail
export const uploadCourseThumbnail = async (courseId, file) => {
  try {
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/courses/${courseId}/thumbnail`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    throw error;
  }
};

export default {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  uploadCourseThumbnail,
};
