import axios from 'axios';
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

// Interceptor to add JWT token from AuthContext
instance.interceptors.request.use(config => {
  const token = window.localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
