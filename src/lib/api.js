import { supabase } from './customSupabaseClient';

// Helper function to handle Supabase errors
const handleSupabaseError = (error, data) => {
  if (error) {
    console.error('Supabase Error:', error);
    throw new Error(error.message || 'Supabase request failed');
  }
  return data;
};

// Auth API (Now handled by AuthContext, but kept for compatibility)
export const authAPI = {
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return handleSupabaseError(error, user);
  },
};

// Expenses API
export const expensesAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    return handleSupabaseError(error, data);
  },

  create: async (expense) => {
    // Get current user to ensure user_id is set
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: user.id }])
      .select()
      .single();
    return handleSupabaseError(error, data);
  },

  update: async (id, expense) => {
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single();
    return handleSupabaseError(error, data);
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  getStats: async () => {
    // Basic stats implementation
    const { data, error } = await supabase.from('expenses').select('amount, category');
    if (error) throw error;
    return data;
  },
};

// Settlements API
export const settlementsAPI = {
  getAll: async () => {
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
  },

  create: async (settlement) => {
    const { data, error } = await supabase
      .from('expense_participants')
      .insert([settlement])
      .select()
      .single();
    return handleSupabaseError(error, data);
  },

  update: async (id, settlement) => {
    const { data, error } = await supabase
      .from('expense_participants')
      .update(settlement)
      .eq('id', id)
      .select()
      .single();
    return handleSupabaseError(error, data);
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('expense_participants')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },
};

// Reminders API
// Note: Transitioning to use the same logic as ReminderNotification.jsx
export const remindersAPI = {
  getAll: async () => {
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
  },

  update: async (id, reminder) => {
    // If it's updating paid_status
    const { data, error } = await supabase
      .from('expense_participants')
      .update(reminder)
      .eq('id', id)
      .select()
      .single();
    return handleSupabaseError(error, data);
  },
};


