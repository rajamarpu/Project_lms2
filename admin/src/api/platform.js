import { publishLmsSync } from '../utils/appSync';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

async function readJsonSafely(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem('lms_token');
  const method = String(options.method || 'GET').toUpperCase();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = { Authorization: `Bearer ${token}`, ...(isFormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers };
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });
  const payload = await readJsonSafely(response);
  if (!response.ok) throw new Error(payload?.error || `Request failed with status ${response.status}`);
  if (method !== 'GET') publishLmsSync();
  return payload;
}

export const platformAdminApi = {
  stats: () => request('/admin/stats'),
  operations: (kind) => request(`/platform/admin/operations/${kind}`),
  analytics: () => request('/platform/admin/analytics'),
  auditLogs: () => request('/platform/admin/audit-logs?limit=100'),
  tickets: () => request('/platform/support-tickets'),
  updateTicket: (id, data) => request(`/platform/support-tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  search: (query) => request(`/platform/admin/search?q=${encodeURIComponent(query)}`),
  users: (role) => request(`/admin/users?limit=100&role=${encodeURIComponent(role)}`),
  createUser: (data) => (typeof FormData !== 'undefined' && data instanceof FormData
    ? request('/admin/users', { method: 'POST', body: data })
    : request('/admin/users', { method: 'POST', body: JSON.stringify(data) })),
  updateUser: (id, data) => (typeof FormData !== 'undefined' && data instanceof FormData
    ? request(`/admin/users/${id}`, { method: 'PUT', body: data })
    : request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  courses: () => request('/admin/courses?limit=100'),
  updateCourse: (id, data) => request(`/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCourse: (id) => request(`/admin/courses/${id}`, { method: 'DELETE' }),
  createCourse: (data) => request('/courses', { method: 'POST', body: JSON.stringify(data) }),
  course: (id) => request(`/courses/${id}`),
  learningPaths: () => request('/courses/learning-paths'),
  editCourse: (id, data) => request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  duplicateCourse: (id) => request(`/courses/${id}/duplicate`, { method: 'POST' }),
  addLesson: (courseId, data) => request(`/courses/${courseId}/lessons`, { method: 'POST', body: JSON.stringify(data) }),
  updateLesson: (courseId, lessonId, data) => request(`/courses/${courseId}/lessons/${lessonId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLesson: (courseId, lessonId) => request(`/courses/${courseId}/lessons/${lessonId}`, { method: 'DELETE' }),
  reorderLessons: (courseId, lessonIds) => request(`/courses/${courseId}/lessons/reorder`, { method: 'PUT', body: JSON.stringify({ lessonIds }) }),
  createAssessment: (courseId, data) => request(`/platform/courses/${courseId}/assessments`, { method: 'POST', body: JSON.stringify(data) }),
  issueCertificate: (enrollmentId) => request(`/platform/certificates/enrollments/${enrollmentId}/issue`, { method: 'POST' }),
  revokeCertificate: (id) => request(`/platform/certificates/${id}/revoke`, { method: 'PUT' }),
  sendNotification: (data) => request('/platform/admin/notifications', { method: 'POST', body: JSON.stringify(data) }),
  createAnnouncement: (data) => request('/platform/admin/announcements', { method: 'POST', body: JSON.stringify(data) }),
  deleteAssessment: (id) => request(`/platform/assessments/${id}`, { method: 'DELETE' }),
  moderateReview: (id, status) => request(`/platform/admin/reviews/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  mediaLibrary: () => request('/upload/media'),
  uploadMedia: (formData) => request('/upload', { method: 'POST', body: formData }),
  deleteMedia: (fileName) => request(`/upload/media/${encodeURIComponent(fileName)}`, { method: 'DELETE' }),
  cmsPages: () => request('/content/admin/cms'),
  cmsPage: (slug) => request(`/content/cms/${encodeURIComponent(slug)}`),
  saveCmsPage: (slug, data) => request(`/content/admin/cms/${encodeURIComponent(slug)}`, { method: 'PUT', body: JSON.stringify(data) }),
  videoJobs: () => request('/content/admin/video-jobs'),
  createVideoJob: (data) => request('/content/admin/video-jobs', { method: 'POST', body: JSON.stringify(data) }),
  startVideoJob: (id) => request(`/content/admin/video-jobs/${id}/start`, { method: 'PUT' }),
  failVideoJob: (id, reason = '') => request(`/content/admin/video-jobs/${id}/fail`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  retryVideoJob: (id) => request(`/content/admin/video-jobs/${id}/retry`, { method: 'PUT' }),
  attachVideoJob: (id, lessonId) => request(`/content/admin/video-jobs/${id}/attach`, { method: 'PUT', body: JSON.stringify({ lessonId }) }),
  personalities: () => request('/features/personalities'),
  createPersonality: (data) => request('/features/admin/personalities', { method: 'POST', body: JSON.stringify(data) }),
  liveSessions: () => request('/features/live-sessions'),
  createLiveSession: (data) => request('/features/live-sessions', { method: 'POST', body: JSON.stringify(data) }),
  deleteLiveSession: (id) => request(`/features/live-sessions/${id}`, { method: 'DELETE' }),
  practiceQuestions: () => request('/features/practice-questions'),
  createPracticeQuestion: (data) => request('/features/practice-questions', { method: 'POST', body: JSON.stringify(data) }),
  communityReports: () => request('/features/admin/community/reports'),
  moderateCommunityReport: (id, action) => request(`/features/admin/community/reports/${id}`, { method: 'PUT', body: JSON.stringify({ action }) }),
};
