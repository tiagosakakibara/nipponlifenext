import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database.
// Uses createClient (localStorage-based session) instead of createBrowserClient
// (cookie-based) so that session persists correctly across page reloads on the
// client side. The cookie-based client (@supabase/ssr) is only used server-side
// (middleware, Server Components, Route Handlers).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
