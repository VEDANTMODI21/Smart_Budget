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
  // Normalize ID (convert _id to id for consistency)
  if (Array.isArray(data)) {
    return data.map(item => ({ ...item, id: item.id || item._id }));
  }
  if (data && typeof data === 'object') {
    return { ...data, id: data.id || data._id };
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

  updateProfile: async (profile) => {
    if (useSupabase) {
      const { data, error } = await supabase.auth.updateUser({
        data: profile
      });
      return handleSupabaseError(error, data);
    }
    const res = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profile)
    });
    return handleResponse(res);
  },
};

// Expenses API
export const expensesAPI = {
  getAll: async (filters = {}) => {
    if (useSupabase) {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          expense_participants (
            id,
            user_id,
            amount_owed,
            paid_status,
            users (name, email)
          )
        `)
        .order('date', { ascending: false });

      if (filters.category) query = query.eq('category', filters.category);
      if (filters.startDate) query = query.gte('date', filters.startDate);
      if (filters.endDate) query = query.lte('date', filters.endDate);

      const { data, error } = await query;
      return handleSupabaseError(error, data);
    }

    const queryParams = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/api/expenses${queryParams ? '?' + queryParams : ''}`, {
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

  generateShareLink: async () => {
    if (useSupabase) {
      const shareToken = crypto.randomUUID();
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('expenses')
        .update({
          share_token: shareToken,
          share_created_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
      if (error) throw error;
      return { shareToken };
    }
    const res = await fetch(`${API_URL}/api/expenses/share`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getShared: async (token) => {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_participants (
            amount_owed,
            paid_status,
            users (name)
          )
        `)
        .eq('share_token', token)
        .order('date', { ascending: false });
      return handleSupabaseError(error, data);
    }
    const res = await fetch(`${API_URL}/api/expenses/shared/${token}`);
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

  markAsPaid: async (participantIds) => {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('expense_participants')
        .update({ paid_status: true })
        .in('id', participantIds);
      return handleSupabaseError(error, data);
    }
    // Local backend bulk update
    const res = await fetch(`${API_URL}/api/settlements/bulk-update`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids: participantIds, updates: { paid_status: true } })
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
        .from('reminders')
        .select('*')
        .order('date', { ascending: true });
      return handleSupabaseError(error, data);
    }
    const res = await fetch(`${API_URL}/api/reminders`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  create: async (reminder) => {
    if (useSupabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('reminders')
        .insert([{ ...reminder, user_id: user.id }])
        .select()
        .single();
      return handleSupabaseError(error, data);
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
        .from('reminders')
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

  sendReminder: async (debt) => {
    if (useSupabase) {
      const { data, error } = await supabase.functions.invoke('send-reminder-email', {
        body: JSON.stringify({
          debtor_email: debt.users.email,
          debtor_name: debt.users.name,
          creditor_email: debt.expenses.users.email,
          creditor_name: debt.expenses.users.name,
          amount: debt.amount_owed,
          expense_description: debt.expenses.description,
        }),
      });
      return handleSupabaseError(error, data);
    }
    const res = await fetch(`${API_URL}/api/reminders/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ debtId: debt.id })
    });
    return handleResponse(res);
  },

  delete: async (id) => {
    if (useSupabase) {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    }
    const res = await fetch(`${API_URL}/api/reminders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};



