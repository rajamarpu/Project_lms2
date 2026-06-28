import { apiRequest } from './config';

// Get all students
export const getStudents = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    // Backend exposes users with role-based filtering: /users?role=user
    const response = await apiRequest(`/users${queryString ? `?${queryString}` : ''}${queryString ? `&role=user` : `?role=user`}`);
    return response;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

// Get student by ID
export const getStudentById = async (studentId) => {
  try {
    const response = await apiRequest(`/users/${studentId}`);
    return response;
  } catch (error) {
    console.error('Error fetching student:', error);
    throw error;
  }
};

// Create student
export const createStudent = async (data) => {
  try {
    // Create a user with student role
    const payload = { ...data, role: 'user' };
    const response = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

// Update student
export const updateStudent = async (studentId, data) => {
  try {
    const response = await apiRequest(`/users/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

// Delete student
export const deleteStudent = async (studentId) => {
  try {
    const response = await apiRequest(`/users/${studentId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};

// Enroll student in course
export const enrollStudent = async (studentId, courseId) => {
  try {
    const response = await apiRequest('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ studentId, courseId }),
    });
    return response;
  } catch (error) {
    console.error('Error enrolling student:', error);
    throw error;
  }
};

// Get student progress
export const getStudentProgress = async (studentId, courseId) => {
  try {
    const response = await apiRequest(`/users/${studentId}/courses/${courseId}/progress`);
    return response;
  } catch (error) {
    console.error('Error fetching student progress:', error);
    throw error;
  }
};

export default {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  enrollStudent,
  getStudentProgress,
};
