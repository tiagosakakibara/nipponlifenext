import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Create client to manage cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })

                    supabaseResponse = NextResponse.next({
                        request,
                    })

                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if expired - required for Server Components
    // Wrapped in try/catch: on Vercel Edge runtime, network errors from getUser()
    // must NOT cause the session cookies to be wiped (which would log the user out).
    try {
        // Attempt to get user. If this fails or times out, we catch the error 
        // to prevent the middleware from returning a clean (logged-out) response.
        const { data: { user } } = await supabase.auth.getUser()

        // If we have a user, it means the session is valid or successfully refreshed.
        // The setAll/getAll above already handled updating the supabaseResponse object.
        return { supabaseResponse, user }
    } catch (error) {
        console.error('[Middleware] Auth refresh error:', error)
        // Network / Edge timeout - return a basic response that keeps existing 
        // request cookies. This avoids accidental logout during network hiccups.
        const fallbackResponse = NextResponse.next({ request })
        return { supabaseResponse: fallbackResponse, user: null }
    }
}
