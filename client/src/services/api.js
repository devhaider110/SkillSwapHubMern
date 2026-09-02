import axios from 'axios';

// ============================================================
// API BASE URL
// ============================================================

// Local development:
// VITE_API_URL=http://localhost:5000/api

// Production:
// VITE_API_URL=https://skillswap-backend-8lqp.onrender.com/api

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://skillswap-backend-8lqp.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// ACCESS TOKEN
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let browser/Axios automatically set multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// REFRESH TOKEN
// ============================================================

let refreshPromise = null;

const clearStoredAuth = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  window.dispatchEvent(new Event('auth:logout'));
};

const requestNewAccessToken = async () => {
  const refreshTokenValue = localStorage.getItem('refreshToken');

  if (!refreshTokenValue) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh-token`, {
        refreshToken: refreshTokenValue,
      })
      .then((response) => {
        const newAccessToken = response?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error('No access token returned');
        }

        localStorage.setItem('accessToken', newAccessToken);

        window.dispatchEvent(
          new Event('auth:token-refreshed')
        );

        return newAccessToken;
      })
      .catch((error) => {
        clearStoredAuth();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const requestUrl = originalRequest.url || '';

    // Don't refresh authentication endpoints
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh-token') ||
      requestUrl.includes('/auth/verify-email') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/reset-password');

    if (
      status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshTokenValue =
      localStorage.getItem('refreshToken');

    if (!refreshTokenValue) {
      clearStoredAuth();
      return Promise.reject(error);
    }

    try {
      const newAccessToken =
        await requestNewAccessToken();

      if (!newAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

// ============================================================
// AUTH
// ============================================================

export const register = (userData) =>
  api.post('/auth/register', userData);

export const login = (userData) =>
  api.post('/auth/login', userData);

export const getMe = () =>
  api.get('/user/me');

export const updateProfile = (data) =>
  api.put('/user/me', data);

export const verifyEmail = (token) =>
  api.get(`/auth/verify-email/${token}`);

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (token, newPassword) =>
  api.post(`/auth/reset-password/${token}`, {
    newPassword,
  });

export const refreshToken = (refreshTokenValue) =>
  api.post('/auth/refresh-token', {
    refreshToken: refreshTokenValue,
  });

export const logout = () =>
  api.post('/auth/logout');

// ============================================================
// SKILLS
// ============================================================

export const addTeachSkill = (data) =>
  api.post('/skills/teach', data);

export const getTeachSkills = () =>
  api.get('/skills/teach');

export const updateTeachSkill = (id, data) =>
  api.put(`/skills/teach/${id}`, data);

export const deleteTeachSkill = (id) =>
  api.delete(`/skills/teach/${id}`);

export const addLearnSkill = (data) =>
  api.post('/skills/learn', data);

export const getLearnSkills = () =>
  api.get('/skills/learn');

export const updateLearnSkill = (id, data) =>
  api.put(`/skills/learn/${id}`, data);

export const deleteLearnSkill = (id) =>
  api.delete(`/skills/learn/${id}`);

export const getMarketplaceSkills = (params) =>
  api.get('/skills/marketplace', { params });

// ============================================================
// SWAPS
// ============================================================

export const createSwapRequest = (data) =>
  api.post('/swaps', data);

export const getIncomingRequests = () =>
  api.get('/swaps/incoming');

export const getOutgoingRequests = () =>
  api.get('/swaps/outgoing');

export const updateRequestStatus = (id, status) =>
  api.put(`/swaps/${id}/status`, { status });

// ============================================================
// MATCHES
// ============================================================

export const getRecommendations = () =>
  api.get('/matches/recommendations');

// ============================================================
// NOTIFICATIONS
// ============================================================

export const getNotifications = () =>
  api.get('/notifications');

export const markNotificationRead = (id) =>
  api.put(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.put('/notifications/read-all');

export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`);

// ============================================================
// SESSIONS
// ============================================================

export const createSession = (data) =>
  api.post('/sessions', data);

export const getMySessions = () =>
  api.get('/sessions');

export const getSession = (id) =>
  api.get(`/sessions/${id}`);

export const updateSessionStatus = (id, status) =>
  api.put(`/sessions/${id}/status`, { status });

export const getMeetingDetails = (id) =>
  api.get(`/sessions/${id}/meeting`);

// ============================================================
// REVIEWS
// ============================================================

export const createReview = (data) =>
  api.post('/reviews', data);

export const getMyReviews = () =>
  api.get('/reviews/me');

export const getUserReviews = (userId) =>
  api.get(`/reviews/user/${userId}`);

export const updateReview = (id, data) =>
  api.put(`/reviews/${id}`, data);

// ============================================================
// SETTINGS
// ============================================================

export const updateSettings = (settings) =>
  api.put('/user/settings', { settings });

export const changePassword = (data) =>
  api.put('/user/change-password', data);

export const deleteAccount = () =>
  api.delete('/user/account');

// ============================================================
// ANALYTICS
// ============================================================

export const getAnalyticsOverview = () =>
  api.get('/analytics/overview');

export const getSkillDistribution = () =>
  api.get('/analytics/skills');

export const getSwapActivity = (period = 'week') =>
  api.get('/analytics/swaps', {
    params: { period },
  });

export const getLearningHours = () =>
  api.get('/analytics/hours');

// ============================================================
// LEADERBOARD
// ============================================================

export const getLeaderboard = (
  type = 'mentors',
  period = 'alltime',
  limit = 10
) =>
  api.get('/leaderboard', {
    params: {
      type,
      period,
      limit,
    },
  });

// ============================================================
// ADMIN
// ============================================================

export const adminGetUsers = (
  page = 1,
  search = ''
) =>
  api.get('/admin/users', {
    params: {
      page,
      limit: 10,
      search,
    },
  });

export const adminUpdateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data);

export const adminDeleteUser = (id) =>
  api.delete(`/admin/users/${id}`);

export const adminGetSkills = (
  page = 1,
  search = ''
) =>
  api.get('/admin/skills', {
    params: {
      page,
      limit: 10,
      search,
    },
  });

export const adminDeleteSkill = (id) =>
  api.delete(`/admin/skills/${id}`);

export const adminGetSwaps = (
  page = 1,
  status = ''
) =>
  api.get('/admin/swaps', {
    params: {
      page,
      limit: 10,
      status,
    },
  });

export const adminUpdateSwap = (id, status) =>
  api.put(`/admin/swaps/${id}`, { status });

// ============================================================
// UPLOADS
// ============================================================

export const uploadProfilePic = (file) => {
  const formData = new FormData();

  formData.append('image', file);

  return api.post(
    '/upload/profile-pic',
    formData
  );
};

export const uploadCoverImage = (file) => {
  const formData = new FormData();

  formData.append('image', file);

  return api.post(
    '/upload/cover-image',
    formData
  );
};

// ============================================================
// SEARCH
// ============================================================

export const globalSearch = (
  q,
  type = 'all',
  limit = 10
) =>
  api.get('/search', {
    params: {
      q,
      type,
      limit,
    },
  });

export const getTrendingSkills = () =>
  api.get('/search/trending');

// ============================================================
// PUBLIC PROFILE
// ============================================================

export const getPublicProfile = (username) =>
  api.get(`/user/profile/${username}`);

// ============================================================
// CHAT
// ============================================================

export const getConversations = () =>
  api.get('/chat/conversations');

export const getOrCreateConversation = (userId) =>
  api.get(`/chat/conversations/${userId}`);

export const getMessages = (
  conversationId,
  page = 1
) =>
  api.get(`/chat/messages/${conversationId}`, {
    params: {
      page,
      limit: 30,
    },
  });

// ============================================================
// RESOURCES
// ============================================================

export const uploadResource = (formData) =>
  api.post('/resources/upload', formData);

export const getResources = (params) =>
  api.get('/resources', { params });

export const getResource = (id) =>
  api.get(`/resources/${id}`);

export const updateResource = (id, data) =>
  api.put(`/resources/${id}`, data);

export const deleteResource = (id) =>
  api.delete(`/resources/${id}`);

export const downloadResource = (id) =>
  api.post(`/resources/${id}/download`);

export const getFolders = () =>
  api.get('/resources/folders');

export const createFolder = (data) =>
  api.post('/resources/folders', data);

export const deleteFolder = (id) =>
  api.delete(`/resources/folders/${id}`);

// ============================================================
// QUIZZES
// ============================================================

export const createQuiz = (data) =>
  api.post('/quizzes', data);

export const getQuizzes = () =>
  api.get('/quizzes');

export const getQuiz = (id) =>
  api.get(`/quizzes/${id}`);

export const submitQuiz = (id, data) =>
  api.post(`/quizzes/${id}/submit`, data);

export const getQuizResults = (
  quizId,
  attemptId
) =>
  api.get(
    `/quizzes/${quizId}/results/${attemptId}`
  );

export const getQuizLeaderboard = (id) =>
  api.get(`/quizzes/${id}/leaderboard`);

// ============================================================
// PROGRESS
// ============================================================

export const getProgressOverview = () =>
  api.get('/progress/overview');

export const getSkillProgress = () =>
  api.get('/progress/skills');

export const getWeeklyActivity = () =>
  api.get('/progress/weekly-activity');

// ============================================================
// COMMUNITY
// ============================================================

export const createPost = (data) =>
  api.post('/community/posts', data);

export const getPosts = (params) =>
  api.get('/community/posts', { params });

export const getPost = (id) =>
  api.get(`/community/posts/${id}`);

export const updatePost = (id, data) =>
  api.put(`/community/posts/${id}`, data);

export const deletePost = (id) =>
  api.delete(`/community/posts/${id}`);

export const toggleLikePost = (id) =>
  api.post(`/community/posts/${id}/like`);

export const addComment = (postId, data) =>
  api.post(
    `/community/posts/${postId}/comments`,
    data
  );

export const deleteComment = (id) =>
  api.delete(`/community/comments/${id}`);

export const toggleLikeComment = (id) =>
  api.post(`/community/comments/${id}/like`);

// ============================================================
// EXPORT
// ============================================================

export default api;