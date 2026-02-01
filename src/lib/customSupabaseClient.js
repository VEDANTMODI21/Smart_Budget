import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only create client if variables exist to avoid crashing the app
export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : {
        from: () => ({
            select: () => ({ eq: () => ({ eq: () => ({ gt: () => ({ order: () => ({ limit: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }) }) }) }) }),
            insert: () => Promise.resolve({ error: new Error('Supabase not configured') }),
            update: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase not configured') }) })
        })
    };
