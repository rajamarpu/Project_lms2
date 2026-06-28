import { apiRequest } from './config';

// Get platform analytics
export const getPlatformAnalytics = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/analytics${queryString ? `?${queryString}` : ''}`);
    return response;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/analytics/revenue${queryString ? `?${queryString}` : ''}`);
    return response;
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    throw error;
  }
};

// Get student growth analytics
export const getStudentGrowthAnalytics = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/analytics/student-growth${queryString ? `?${queryString}` : ''}`);
    return response;
  } catch (error) {
    console.error('Error fetching student growth analytics:', error);
    throw error;
  }
};

// Get engagement analytics
export const getEngagementAnalytics = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/analytics/engagement${queryString ? `?${queryString}` : ''}`);
    return response;
  } catch (error) {
    console.error('Error fetching engagement analytics:', error);
    throw error;
  }
};

// Get course performance analytics
export const getCoursePerformanceAnalytics = async (courseId) => {
  try {
    const response = await apiRequest(`/analytics/courses/${courseId}`);
    return response;
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    throw error;
  }
};

// Get teacher performance analytics
export const getTeacherPerformanceAnalytics = async (teacherId) => {
  try {
    const response = await apiRequest(`/analytics/teachers/${teacherId}`);
    return response;
  } catch (error) {
    console.error('Error fetching teacher performance analytics:', error);
    throw error;
  }
};

// Export analytics report
export const exportAnalyticsReport = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/analytics/export${queryString ? `?${queryString}` : ''}`);
    return response;
  } catch (error) {
    console.error('Error exporting analytics:', error);
    throw error;
  }
};

export default {
  getPlatformAnalytics,
  getRevenueAnalytics,
  getStudentGrowthAnalytics,
  getEngagementAnalytics,
  getCoursePerformanceAnalytics,
  getTeacherPerformanceAnalytics,
  exportAnalyticsReport,
};
