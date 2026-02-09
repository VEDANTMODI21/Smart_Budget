import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only create client if variables exist to avoid crashing the app
export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : {
        auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithPassword: () => Promise.resolve({ data: {}, error: new Error('Supabase not configured') }),
            signUp: () => Promise.resolve({ data: {}, error: new Error('Supabase not configured') }),
            signInWithOtp: () => Promise.resolve({ data: {}, error: new Error('Supabase not configured') }),
            verifyOtp: () => Promise.resolve({ data: {}, error: new Error('Supabase not configured') }),
            signOut: () => Promise.resolve({ error: null }),
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        },
        from: () => ({
            select: () => ({ eq: () => ({ eq: () => ({ gt: () => ({ order: () => ({ limit: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }) }) }) }) }),
            insert: () => Promise.resolve({ error: new Error('Supabase not configured') }),
            update: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase not configured') }) })
        })
    };
