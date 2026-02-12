import { createBrowserClient } from '@supabase/ssr'

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const isProd = process.env.NODE_ENV === 'production';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
        domain: isProd ? '.nippon-life.com' : undefined,
        path: '/',
        sameSite: 'lax',
        secure: isProd,
    }
});
