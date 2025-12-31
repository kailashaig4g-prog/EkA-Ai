import axios from 'axios';
import useAuthStore from '../store/authStore';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// AI APIs
export const aiAPI = {
  ask: (question, category = 'All') => api.post('/ai/ask', { question, category }),
  getHistory: () => api.get('/ai/history'),
};

// GSTSAAS APIs
export const gstsaasAPI = {
  createJobCard: (data) => api.post('/gstsaas/job-card', data),
  getJobCards: () => api.get('/gstsaas/job-cards'),
};

// URGAA APIs
export const urgaaAPI = {
  getStations: () => api.get('/urgaa/stations'),
  getMetrics: () => api.get('/urgaa/metrics'),
};

// ARJUN APIs
export const arjunAPI = {
  getCourses: () => api.get('/arjun/courses'),
  getProgress: () => api.get('/arjun/progress'),
};

// IGNITION APIs
export const ignitionAPI = {
  getMetrics: () => api.get('/ignition/metrics'),
  getChurnRisks: () => api.get('/ignition/churn-risks'),
};

// Support APIs
export const supportAPI = {
  createTicket: (data) => api.post('/support/tickets', data),
  getTickets: () => api.get('/support/tickets'),
  getMetrics: () => api.get('/support/metrics'),
};

// Finance APIs
export const financeAPI = {
  getDashboard: () => api.get('/finance/dashboard'),
};

// Legal APIs
export const legalAPI = {
  getContracts: () => api.get('/legal/contracts'),
};

// General APIs
export const generalAPI = {
  getDepartments: () => api.get('/departments'),
  getProducts: () => api.get('/products'),
  getHealth: () => api.get('/health'),
};

export default api;
