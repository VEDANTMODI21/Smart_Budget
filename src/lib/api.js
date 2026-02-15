import { supabase } from './customSupabaseClient';

// Determine if we should use Supabase. Default to true if keys are present in production.
const useSupabase =
  import.meta.env.VITE_USE_SUPABASE === 'true' ||
  (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.MODE === 'production');

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  // In production, don't assume port 5000 unless specified via VITE_API_URL
  return '';
};

const API_URL = getApiUrl();

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }
  // Normalize ID (convert _id to id for consistency)
  if (Array.isArray(data)) {
    return data.map(item => ({ ...item, id: item.id || item._id }));
  }
  if (data && typeof data === 'object') {
    return { ...data, id: data.id || data._id };
  }
  return data;
};

// Helper function to handle Supabase errors
const handleSupabaseError = (error, data) => {
  if (error) {
    console.error('Supabase Error:', error);
    throw new Error(error.message || 'Supabase request failed');
  }
  return data;
};

// Auth API
export const authAPI = {
  getCurrentUser: async () => {
    if (useSupabase) {
      const { data: { user }, error } = await supabase.auth.getUser();
      return handleSupabaseError(error, user);
    }
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },
};

// Expenses API
export const expensesAPI = {
  getAll: async () => {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      return handleSupabaseError(error, data);
    }
    const res = await fetch(`${API_URL}/api/expenses`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  create: async (expense) => {
    if (useSupabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('expenses')
        .insert([{ ...expense, user_id: user.id }])
        .select()
        .single();
      return handleSupabaseError(error, data);
    }
    const res = await fetch(`${API_URL}/api/expenses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(expense)
    });
    return handleResponse(res);
  },

  update: async (id, expense) => {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('expenses')
        .update(expense)
        .eq('id', id)
        .select()
        .single();
      return handleSupabaseError(error, data);
    }
    const res = await fetch(`${API_URL}/api/expenses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(expense)
    });
    return handleResponse(res);
  },

  delete: async (id) => {
    if (useSupabase) {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    const res = await fetch(`${API_URL}/api/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getStats: async () => {
    if (useSupabase) {
      const { data, error } = await supabase.from('expenses').select('amount, category');
      if (error) throw error;
      return data;
    }
    const res = await fetch(`${API_URL}/api/expenses/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },
};

// Settlements API
export const settlementsAPI = {
  getAll: async () => {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('expense_participants')
        .select(`
          *,
          users!expense_participants_user_id_fkey (name, email),
          expenses (
            user_id,
            description,
            amount,
            users!expenses_user_id_fkey (name, email)
          )
        `)
        .eq('paid_status', false);
      return handleSupabaseError(error, data);
    }
    const res = await fetch(`${API_URL}/api/settlements`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  create: async (settlement) => {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('expense_participants')
        .insert([settlement])
        .select()
        .single();
      return handleSupabaseError(error, data);
    }
    const res = await fetch(`${API_URL}/api/settlements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(settlement)
    });
    return handleResponse(res);
  },

  update: async (id, settlement) => {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('expense_participants')
        .update(settlement)
        .eq('id', id)
        .select()
        .single();
      return handleSupabaseError(error, data);
    }
    const res = await fetch(`${API_URL}/api/settlements/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settlement)
    });
    return handleResponse(res);
  },

  delete: async (id) => {
    if (useSupabase) {
      const { error } = await supabase
        .from('expense_participants')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    const res = await fetch(`${API_URL}/api/settlements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },
};

// Reminders API
export const remindersAPI = {
  getAll: async () => {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('expense_participants')
        .select(`
          *,
          users!expense_participants_user_id_fkey (name, email),
          expenses (
            user_id,
            description,
            amount,
            users!expenses_user_id_fkey (name, email)
          )
        `)
        .eq('paid_status', false);
      return handleSupabaseError(error, data);
    }
    const res = await fetch(`${API_URL}/api/reminders`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  create: async (reminder) => {
    if (useSupabase) {
      // Supabase implementation for create reminder if needed
      return { error: 'Not implemented in Supabase' };
    }
    const res = await fetch(`${API_URL}/api/reminders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reminder)
    });
    return handleResponse(res);
  },

  update: async (id, reminder) => {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('expense_participants')
        .update(reminder)
        .eq('id', id)
        .select()
        .single();
      return handleSupabaseError(error, data);
    }
    const res = await fetch(`${API_URL}/api/reminders/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(reminder)
    });
    return handleResponse(res);
  },

  delete: async (id) => {
    if (useSupabase) return { error: 'Not implemented' };
    const res = await fetch(`${API_URL}/api/reminders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};



