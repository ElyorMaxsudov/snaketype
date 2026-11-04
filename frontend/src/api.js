import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// So'rovlarga avtomatik Bearer tokenni qo'shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('snaketype_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  googleAuth: (googleData) => api.post('/auth/google', googleData),
  getMe: () => api.get('/auth/me'),
};

export const userAPI = {
  searchUsers: (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
  getFriends: () => api.get('/users/friends'),
  sendFriendRequest: (targetUserId) => api.post(`/users/friends/request/${targetUserId}`),
  acceptFriendRequest: (requestId) => api.post(`/users/friends/accept/${requestId}`),
  rejectFriendRequest: (requestId) => api.post(`/users/friends/reject/${requestId}`),
  getUserProfile: (username) => api.get(`/users/profile/${username}`),
  getLeaderboard: () => api.get('/users/leaderboard'),
};

export const statsAPI = {
  saveResult: (resultData) => api.post('/stats/save', resultData),
  getHistory: () => api.get('/stats/history'),
};

export default api;
