import { type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { updateSession } from './utils/supabase/middleware'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
    // 1. Run Supabase Session Update (refresh Auth tokens)
    // We capture the response which might contain updated cookies
    const { supabaseResponse, user } = await updateSession(request)

    // 2. Run i18n Middleware (handle locale routing)
    const response = intlMiddleware(request)

    // 3. Merge Supabase Cookies into the final response
    // This ensures that if the session was refreshed, the new cookies are sent to the browser
    supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, cookie)
    })

    return response
}

export const config = {
    matcher: [
        // Match all pathnames except for
        // - … if they start with `/api`, `/_next` or `/_vercel`
        // - … the ones containing a dot (e.g. `favicon.ico`)
        '/((?!api|_next|_vercel|.*\\..*).*)',
    ],
}
