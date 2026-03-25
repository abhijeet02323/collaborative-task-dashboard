import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  register: (firstName, lastName, email, password) =>
    api.post('/auth/register', { firstName, lastName, email, password }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  updateProfile: (firstName, lastName) =>
    api.put('/auth/profile', { firstName, lastName }),
};

const taskService = {
  createTask: (title, description, priority, dueDate) =>
    api.post('/tasks', { title, description, priority, dueDate }),
  
  getTasks: (limit = 20, offset = 0) =>
    api.get(`/tasks?limit=${limit}&offset=${offset}`),
  
  getTask: (id) =>
    api.get(`/tasks/${id}`),
  
  updateTask: (id, updates) =>
    api.put(`/tasks/${id}`, updates),
  
  deleteTask: (id) =>
    api.delete(`/tasks/${id}`),
  
  getAllTasks: (limit = 20, offset = 0) =>
    api.get(`/tasks/all?limit=${limit}&offset=${offset}`),
};

export { authService, taskService, api };
