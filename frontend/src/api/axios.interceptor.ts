import axios from 'axios';

const api = axios.create({
  baseURL: '/', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add /api prefix to all requests except those that already have it
    if (!config.url?.startsWith('/api')) {
      config.url = `/api${config.url}`;
    }

    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401: {
          const url = error.config?.url ?? '';
          // A 401 from login/register is just rejected credentials, not an
          // expired session — the page handles it. Redirecting here reloads
          // the page and wipes the error message.
          if (url.includes('/auth/login') || url.includes('/auth/register')) {
            break;
          }
          localStorage.removeItem('jwt_token');
          window.location.href = '/login';
          break;
        }
        case 403:
          // Handle forbidden
          console.error('Forbidden access:', error.response.data);
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default api; 