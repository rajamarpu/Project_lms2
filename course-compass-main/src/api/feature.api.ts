import API from './client';

export const featureApi = {
  personalities: () => API.get('/features/personalities'),
  liveSessions: () => API.get('/features/live-sessions'),
  createLiveSession: (data: Record<string, unknown>) => API.post('/features/live-sessions', data),
  topics: () => API.get('/features/community/topics'),
  createTopic: (data: { title: string; description?: string }) => API.post('/features/community/topics', data),
  posts: (topicId: string) => API.get(`/features/community/topics/${topicId}/posts`),
  createPost: (topicId: string, body: string) => API.post(`/features/community/topics/${topicId}/posts`, { body }),
  reportPost: (postId: string, reason: string) => API.post(`/features/community/posts/${postId}/report`, { reason }),
  chat: (roomId: string) => API.get(`/features/chat/rooms/${roomId}`),
  sendChat: (data: { roomId: string; content: string; personalityId?: string; courseId?: string }) => API.post('/features/chat/messages', data),
  practiceQuestions: (params?: { category?: string; difficulty?: string }) => API.get('/features/practice-questions', { params }),
  validatePracticeAnswer: (id: string, answer: unknown) => API.post(`/features/practice-questions/${id}/validate`, { answer }),
};
