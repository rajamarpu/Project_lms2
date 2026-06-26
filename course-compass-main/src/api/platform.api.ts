import API from './client';

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  readAt?: string;
  createdAt: string;
};

export type Preferences = {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  courseNotifications: boolean;
  deadlineReminders: boolean;
  reducedMotion: boolean;
};

export type SupportTicket = {
  id: string;
  subject: string;
  description?: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt?: string;
  assignee?: { name?: string } | null;
  _count?: { messages?: number };
};

export const platformApi = {
  notifications: () => API.get<{ data: NotificationItem[] }>('/platform/notifications'),
  readNotification: (id: string) => API.put(`/platform/notifications/${id}/read`),
  readAllNotifications: () => API.put('/platform/notifications/read-all'),
  preferences: () => API.get<{ data: Preferences }>('/platform/preferences'),
  updatePreferences: (data: Partial<Preferences>) => API.put('/platform/preferences', data),
  bookmarks: () => API.get('/platform/bookmarks'),
  toggleBookmark: (courseId: string) => API.put(`/platform/bookmarks/${courseId}`),
  payments: () => API.get('/platform/payments'),
  createTicket: (data: { subject: string; description: string; priority?: string }) => API.post('/platform/support-tickets', data),
  certificates: () => API.get('/platform/certificates'),
  courseWork: (courseId: string) => API.get(`/platform/courses/${courseId}/my-work`),
  submitAssessment: (id: string, answers: Record<string, unknown>) => API.post(`/platform/assessments/${id}/submit`, { answers }),
  submitAssignment: (id: string, data: { text?: string; fileUrl?: string }) => API.post(`/platform/assignments/${id}/submit`, data),
  verifyCertificate: (verificationId: string) => API.get(`/platform/certificates/verify/${verificationId}`),
  reviews: (courseId: string) => API.get(`/platform/reviews/${courseId}`),
  submitReview: (courseId: string, data: { rating: number; comment?: string }) => API.put(`/platform/reviews/${courseId}`, data),
  announcements: () => API.get('/platform/announcements'),
  supportTickets: () => API.get<{ data: SupportTicket[] }>('/platform/support-tickets'),
};
