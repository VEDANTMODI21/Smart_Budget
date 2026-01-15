// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (name, email, password) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  generateOTP: (email, name) =>
    apiRequest('/auth/otp/generate', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    }),

  verifyOTP: (email, otp, name) =>
    apiRequest('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp, name }),
    }),

  getCurrentUser: () => apiRequest('/auth/me'),
};

// Expenses API
export const expensesAPI = {
  getAll: () => apiRequest('/expenses'),
  
  create: (expense) =>
    apiRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    }),

  update: (id, expense) =>
    apiRequest(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    }),

  delete: (id) =>
    apiRequest(`/expenses/${id}`, {
      method: 'DELETE',
    }),

  getStats: () => apiRequest('/expenses/stats'),
};

// Settlements API
export const settlementsAPI = {
  getAll: () => apiRequest('/settlements'),
  
  create: (settlement) =>
    apiRequest('/settlements', {
      method: 'POST',
      body: JSON.stringify(settlement),
    }),

  update: (id, settlement) =>
    apiRequest(`/settlements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(settlement),
    }),

  delete: (id) =>
    apiRequest(`/settlements/${id}`, {
      method: 'DELETE',
    }),
};

// Reminders API
export const remindersAPI = {
  getAll: () => apiRequest('/reminders'),
  
  create: (reminder) =>
    apiRequest('/reminders', {
      method: 'POST',
      body: JSON.stringify(reminder),
    }),

  update: (id, reminder) =>
    apiRequest(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reminder),
    }),

  delete: (id) =>
    apiRequest(`/reminders/${id}`, {
      method: 'DELETE',
    }),
};

