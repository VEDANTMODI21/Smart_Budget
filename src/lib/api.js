// API Configuration
// Auto-detect API URL: use environment variable, or try to detect from current host
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    // If VITE_API_URL is set, use it (should include /api)
    return import.meta.env.VITE_API_URL.endsWith('/api')
      ? import.meta.env.VITE_API_URL
      : `${import.meta.env.VITE_API_URL}/api`;
  }

  // Check if we're on localhost - use Vite proxy (relative URL)
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/api';
  }

  // For production/network access, default to relative /api
  // This is much safer than assuming port 5000 on a production host
  // If the backend is on a different domain, VITE_API_URL should be set in the deployment dash
  return '/api';
};

const API_URL = getApiUrl();

// Debug: Log API URL in development
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', API_URL);
}

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
    const fullUrl = `${API_URL}${endpoint}`;

    // Debug logging in development
    if (import.meta.env.DEV) {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${fullUrl}`);
      if (token) {
        console.log(`🔑 Token present: ${token.substring(0, 20)}...`);
      } else {
        console.warn('⚠️  No token in request');
      }
    }

    const response = await fetch(fullUrl, config);

    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('❌ Non-JSON response:', text);
      throw new Error(text || 'Request failed');
    }

    if (!response.ok) {
      // Log error details in development
      if (import.meta.env.DEV) {
        console.error(`❌ API Error ${response.status}:`, data);
      }
      throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Make sure the backend is running and accessible.');
    }

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

