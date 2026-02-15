# Arquitetura de Autenticação — Next.js App Router + Supabase SSR

**Referência portável.** Use este documento como base para implementar autenticação em qualquer novo projeto Next.js + Supabase. Todo o código aqui é canônico — foi validado em produção e corrige armadilhas reais.

---

## Stack e Dependências

```bash
npm install @supabase/supabase-js @supabase/ssr next-intl
```

| Pacote | Versão testada | Papel |
|--------|---------------|-------|
| `@supabase/supabase-js` | ^2.94 | Tipos (`User`, etc.) e cliente admin |
| `@supabase/ssr` | ^0.8 | `createBrowserClient` (client) e `createServerClient` (servidor/middleware) |
| `next` | 16.x | App Router, middleware, Route Handlers |

---

## Arquivos Envolvidos e Papel de Cada Um

```
src/
├── lib/
│   └── supabaseClient.ts          ← Cliente browser (client components e hooks)
├── utils/supabase/
│   ├── middleware.ts               ← updateSession(): refresca tokens a cada request
│   └── server.ts                   ← createClient() para Server Components
├── middleware.ts                   ← Encadeia Supabase + i18n
├── contexts/
│   └── AuthContext.tsx             ← Estado de auth global (user, profile, loading)
├── hooks/
│   └── useAuth.ts                  ← Hook que expõe o AuthContext
└── app/
    └── auth/callback/route.ts      ← Route Handler: troca code→session (PKCE/OAuth)
```

---

## Fluxo Completo

### Login com Email/Password

```
LoginPage
  └─ supabase.auth.signInWithPassword({ email, password })
       └─ Supabase seta cookies de sessão no browser
            └─ window.location.href = '/destino'   ← FULL RELOAD obrigatório
                 └─ middleware.ts
                      └─ updateSession() → getUser() valida com servidor → cookies renovados
                           └─ AuthProvider monta
                                └─ onAuthStateChange dispara SIGNED_IN (ou INITIAL_SESSION)
                                     └─ user setado imediatamente (síncrono)
                                          └─ setTimeout → getProfile() → profile setado
```

### Login com Google OAuth

```
LoginPage
  └─ supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback?next=...' } })
       └─ Redireciona para Google
            └─ Google redireciona para: https://<PROJETO>.supabase.co/auth/v1/callback
                 └─ Supabase redireciona para: /auth/callback?code=XXXX&next=...
                      └─ Route Handler: auth/callback/route.ts
                           └─ exchangeCodeForSession(code) → cookies de sessão setados
                                └─ NextResponse.redirect(next)
                                     └─ (mesmo fluxo do reload acima)
```

### Reload da Página (Ctrl+R)

```
Browser envia cookies de sessão
  └─ middleware.ts
       └─ updateSession() → getUser() valida/renova tokens → cookies atualizados na resposta
            └─ AuthProvider monta
                 └─ onAuthStateChange dispara INITIAL_SESSION
                      └─ session.user presente → user setado imediatamente
                           └─ setTimeout → getProfile() → loading: false
```

### Logout

```
supabase.auth.signOut()
  └─ Cookies de sessão removidos
       └─ window.location.href = '/home'   ← FULL RELOAD para limpar estado
            └─ onAuthStateChange dispara SIGNED_OUT
                 └─ setAuthState({ user: null, profile: null, loading: false })
```

---

## Código Canônico

### `src/lib/supabaseClient.ts`

```ts
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// OBRIGATÓRIO: createBrowserClient (cookie-based), NÃO createClient (localStorage).
// O middleware usa createServerClient (também cookie-based).
// Os dois precisam do mesmo mecanismo de storage para a sessão persistir no reload.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
```

---

### `src/utils/supabase/middleware.ts`

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // getUser() valida com o servidor — NUNCA usar getSession() aqui
    try {
        const { data: { user } } = await supabase.auth.getUser()
        return { supabaseResponse, user }
    } catch (error) {
        // Edge timeout: retorna fallback com cookies existentes para evitar logout acidental
        const fallbackResponse = NextResponse.next({ request })
        return { supabaseResponse: fallbackResponse, user: null }
    }
}
```

---

### `src/utils/supabase/server.ts`

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignorado em Server Components (middleware já cuida dos cookies)
                    }
                },
            },
        }
    )
}
```

---

### `src/middleware.ts`

```ts
import { type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { supabaseResponse } = await updateSession(request)
    return supabaseResponse
}

export const config = {
    matcher: [
        // Exclui: API routes, assets Next.js, arquivos estáticos, rota de callback OAuth
        '/((?!api|_next|_vercel|auth|.*\\..*).*)',
    ],
}
```

> Se o projeto usar `next-intl`, o middleware encadeia: primeiro `updateSession`, depois `intlMiddleware`. Copiar cookies do supabaseResponse para a resposta final do intl em caso de redirect.

---

### `src/contexts/AuthContext.tsx`

```ts
"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthProfile {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    role: 'user' | 'admin' | 'photographer';
    status: string;
}

interface AuthContextType {
    user: User | null;
    profile: AuthProfile | null;
    loading: boolean;
    isAdmin: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<{
        user: User | null;
        profile: AuthProfile | null;
        loading: boolean;
    }>({ user: null, profile: null, loading: true });

    const fetchIdRef = useRef(0);

    const getProfile = useCallback(async (currentUser: User): Promise<AuthProfile> => {
        const { data } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url, role, status')
            .eq('id', currentUser.id)
            .single();
        // Fallback se perfil não existir ainda (ex: novo usuário OAuth)
        return data ?? {
            id: currentUser.id,
            role: 'user',
            full_name: currentUser.user_metadata?.full_name ?? '',
            username: currentUser.email?.split('@')[0] ?? 'usuario',
            avatar_url: currentUser.user_metadata?.avatar_url ?? null,
            status: 'active',
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        // REGRA CRÍTICA: callback NUNCA pode ser async.
        // O SDK aguarda o callback terminar antes de resolver a sessão.
        // Se o callback for async e usar await com o mesmo cliente Supabase → deadlock.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return;

            const currentUser = session?.user ?? null;

            if (event === 'SIGNED_OUT') {
                setAuthState({ user: null, profile: null, loading: false });
                return;
            }

            if (
                event === 'INITIAL_SESSION' ||
                event === 'SIGNED_IN' ||
                event === 'TOKEN_REFRESHED' ||
                event === 'USER_UPDATED'
            ) {
                if (!currentUser) {
                    setAuthState({ user: null, profile: null, loading: false });
                    return;
                }

                const fetchId = ++fetchIdRef.current;

                // Seta user imediatamente — a UI vê o usuário sem esperar o perfil
                setAuthState({ user: currentUser, profile: null, loading: true });

                // setTimeout(fn, 0): despacha o fetch para fora do ciclo do SDK
                setTimeout(() => {
                    if (!mounted) return;
                    getProfile(currentUser).then((profile) => {
                        if (mounted && fetchId === fetchIdRef.current) {
                            setAuthState({ user: currentUser, profile, loading: false });
                        }
                    });
                }, 0);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [getProfile]);

    const value: AuthContextType = {
        user: authState.user,
        profile: authState.profile,
        loading: authState.loading,
        isAdmin: authState.profile?.role === 'admin',
        refreshProfile: async () => {
            if (authState.user) {
                const fetchId = ++fetchIdRef.current;
                const profile = await getProfile(authState.user);
                if (fetchId === fetchIdRef.current) {
                    setAuthState(prev => ({ ...prev, profile }));
                }
            }
        },
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
    return context;
}
```

---

### `src/app/auth/callback/route.ts`

```ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocal = origin.includes('localhost');
    const baseUrl = isLocal ? origin : forwardedHost ? `https://${forwardedHost}` : origin;

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch { /* ignorado em Server Components */ }
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${baseUrl}${next}`);
        }
    }

    // Sem ?code=: pode ser Implicit Flow (token no fragmento #).
    // Fragmentos nunca chegam ao servidor — redirecionar para next deixa o
    // browser client processar o token do fragmento automaticamente.
    const safeNext = next.startsWith('/') ? next : '/';
    return NextResponse.redirect(`${baseUrl}${safeNext}`);
}
```

---

### `src/hooks/useAuth.ts`

```ts
"use client";
import { useAuthContext } from '@/contexts/AuthContext';

export function useAuth() {
    return useAuthContext();
}
```

---

### Uso no layout raiz (`app/[locale]/layout.tsx`)

```tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
```

---

## Regras de Ouro

### O que FAZER

| Regra | Motivo |
|-------|--------|
| Usar `createBrowserClient` do `@supabase/ssr` no client | Sincroniza cookies com o middleware SSR |
| Usar `createServerClient` do `@supabase/ssr` no middleware e server | Gerencia cookies HTTP corretamente |
| Callback do `onAuthStateChange` sempre **síncrono** | `async` causa deadlock no SDK Supabase |
| Despachar trabalho assíncrono via `setTimeout(fn, 0)` | Libera o ciclo interno do SDK |
| Usar `window.location.href` após login/logout | Full reload garante cookies frescos e estado limpo |
| Usar `getUser()` no middleware (não `getSession()`) | `getUser()` valida com o servidor; `getSession()` lê cache local sem validar |
| Usar chave **Legacy JWT** (`eyJ...`), não publishable key (`sb_publishable_...`) | Publishable keys não funcionam com `signInWithPassword()` |

### O que NÃO FAZER

| Proibido | Por quê |
|----------|---------|
| `import { createClient } from '@supabase/supabase-js'` no browser | Usa localStorage — não sincroniza com cookies do middleware |
| `onAuthStateChange(async (event, session) => { ... })` | Deadlock: SDK aguarda callback que aguarda SDK |
| `router.push()` + `router.refresh()` sequencialmente após login | Condição de corrida no React 19 / Next.js 16 |
| `getSession()` para validar auth no servidor | Não valida com o servidor Supabase — pode retornar token expirado |
| Chamar `getProfile()` fora do `setTimeout` dentro do callback | Mesmo efeito do deadlock acima |
| Alterar cookies de sessão no middleware sem propagar para a resposta | Sessão se perde na próxima request |

---

## Como Adicionar um Novo Provider OAuth

### 1. Supabase Dashboard
- Authentication → Sign In / Providers → habilitar o provider desejado
- Inserir Client ID e Client Secret do provedor
- Copiar o Callback URL: `https://<PROJETO>.supabase.co/auth/v1/callback`

### 2. Console do Provedor (ex: Google Cloud, GitHub, Facebook)
- Criar credenciais OAuth
- Adicionar como **Authorized Redirect URI**: `https://<PROJETO>.supabase.co/auth/v1/callback`

### 3. URL Configuration no Supabase
- Authentication → URL Configuration → Redirect URLs
- Adicionar: `https://seu-dominio.com/auth/callback`
- Adicionar: `http://localhost:3000/auth/callback` (desenvolvimento)

### 4. Código no componente de login

```ts
const handleSocialLogin = async (provider: 'google' | 'github' | 'facebook') => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
    });
    if (error) console.error(error);
};
```

Nenhuma outra mudança é necessária — o Route Handler `/auth/callback` já processa qualquer provider.

---

## Variáveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<PROJETO>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...   # Legacy JWT
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Apenas server-side (nunca expor no client)
```

> A `NEXT_PUBLIC_SUPABASE_ANON_KEY` deve ser a **Legacy JWT key** (começa com `eyJ`), não a publishable key (começa com `sb_publishable_`). As publishable keys não são compatíveis com o SDK de auth.

---

## Checklist de Verificação Pós-Implementação

- [ ] Login com email/senha funciona e redireciona corretamente
- [ ] Após login, Ctrl+R mantém o usuário logado
- [ ] Login com Google funciona (sem `?error=AuthCodeError` na URL)
- [ ] Após login Google, Ctrl+R mantém o usuário logado
- [ ] Logout limpa a sessão e redireciona
- [ ] Após logout, Ctrl+R permanece deslogado
- [ ] Console do browser não exibe erros de auth ou cookie
- [ ] Em aba anônima (zero cookies), o fluxo completo funciona do zero
- [ ] `loading` nunca fica `true` indefinidamente (verificar com React DevTools)
- [ ] `user` é setado antes de `profile` (UI não quebra durante o fetch do perfil)
