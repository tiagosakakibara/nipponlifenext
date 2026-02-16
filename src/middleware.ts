import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { updateSession } from './utils/supabase/middleware'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
    // 1. Run Supabase Session Update (refresh Auth tokens)
    const { supabaseResponse, user, supabase } = await updateSession(request)

    // Security Check: Admin Routes
    if (request.nextUrl.pathname.match(/^\/(?:[a-z]{2}\/)?admin(?:$|\/)/)) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            const resp = NextResponse.redirect(url)
            // Persist session if it was refreshed
            supabaseResponse.cookies.getAll().forEach(c => resp.cookies.set(c))
            return resp
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            // Check for approved content access
            const { count } = await supabase
                .from('content_creation_access')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'approved')

            if (!count || count === 0) {
                const resp = NextResponse.redirect(new URL('/', request.url))
                // Persist session if it was refreshed
                supabaseResponse.cookies.getAll().forEach(c => resp.cookies.set(c))
                return resp
            }
        }
    }

    // 2. Run i18n Middleware on the (possibly cookie-mutated) request
    const intlResponse = intlMiddleware(request)

    // 3. If intl wants to redirect (e.g. locale change), honour the redirect
    //    but still carry the Supabase session cookies
    const isRedirect = intlResponse.status >= 300 && intlResponse.status < 400
    if (isRedirect) {
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            intlResponse.cookies.set(cookie.name, cookie.value, cookie)
        })
        return intlResponse
    }

    // 4. For non-redirect responses, use supabaseResponse as the base
    //    (it holds NextResponse.next({ request }) with the mutated request,
    //    so Server Components will see the refreshed session cookies).
    //    Copy all intl headers/cookies into it.
    intlResponse.headers.forEach((value, key) => {
        supabaseResponse.headers.set(key, value)
    })
    intlResponse.cookies.getAll().forEach((cookie) => {
        supabaseResponse.cookies.set(cookie.name, cookie.value, cookie)
    })

    return supabaseResponse
}

export const config = {
    matcher: [
        // Match all pathnames except for
        // - … if they start with `/api`, `/_next` or `/_vercel`
        // - … the ones containing a dot (e.g. `favicon.ico`)
        // - … the auth callback route
        '/((?!api|_next|_vercel|auth|.*\\..*).*)',
    ],
}
