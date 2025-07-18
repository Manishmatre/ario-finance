import axios from 'axios';

// Validate and set the base URL
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const defaultUrl = 'https://SSKfinance-backend.onrender.com';
  
  // If VITE_API_URL is set and not empty, use it
  if (envUrl && envUrl.trim() !== '') {
    // Ensure the URL ends with a slash
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  return defaultUrl;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Request URL:', config.url);
    console.log('Request Method:', config.method);
    
    // Only add auth header for non-login/register requests
    if (!['/api/auth/login', '/api/auth/register'].includes(config.url)) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response Status:', response.status);
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      },
    });

    if (error.response?.status === 401) {
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('company');
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
