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
    let user = null
    try {
        const { data } = await supabase.auth.getUser()
        user = data.user
    } catch {
        // Network / Edge timeout - keep existing cookies intact by returning a
        // fresh response so no accidental Set-Cookie clear headers are included.
        supabaseResponse = NextResponse.next({ request })
    }

    return { supabaseResponse, user }
}
