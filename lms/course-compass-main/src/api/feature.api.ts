import API from './client';

export const featureApi = {
  personalities: () => API.get('/features/personalities'),
  topics: () => API.get('/features/community/topics'),
  createTopic: (data: { title: string; description?: string }) => API.post('/features/community/topics', data),
  posts: (topicId: string) => API.get(`/features/community/topics/${topicId}/posts`),
  createPost: (topicId: string, body: string) => API.post(`/features/community/topics/${topicId}/posts`, { body }),
  reportPost: (postId: string, reason: string) => API.post(`/features/community/posts/${postId}/report`, { reason }),
  chat: (roomId: string) => API.get(`/features/chat/rooms/${roomId}`),
  sendChat: (data: { roomId: string; content: string; personalityId?: string; courseId?: string }) => API.post('/features/chat/messages', data),
  flashcardDecks: () => API.get('/features/flashcard-decks'),
  flashcardDeck: (id: string) => API.get(`/features/flashcard-decks/${id}`),
  saveFlashcardProgress: (id: string, data: { currentCard: number; viewedCards: number }) => API.put(`/features/flashcard-decks/${id}/progress`, data),
};
