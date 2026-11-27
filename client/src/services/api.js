import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop on auth endpoints
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token expired or invalid
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// In-flight GET request deduplication to prevent duplicate concurrent hits to Hostinger PHP workers
const rawGet = api.get.bind(api);
const inFlightGetRequests = new Map();

api.get = (url, config = {}) => {
  const cacheKey = `${url}::${JSON.stringify(config?.params || {})}`;
  if (inFlightGetRequests.has(cacheKey)) {
    return inFlightGetRequests.get(cacheKey);
  }

  const promise = rawGet(url, config).finally(() => {
    inFlightGetRequests.delete(cacheKey);
  });

  inFlightGetRequests.set(cacheKey, promise);
  return promise;
};

export default api;
