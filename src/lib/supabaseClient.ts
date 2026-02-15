import { createBrowserClient } from '@supabase/ssr'

// Create a single supabase client for interacting with your database.
// Changed to use createBrowserClient (cookie-based) to align with Next.js SSR and Middleware.
// This fixes the session loss issue on page reload.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
