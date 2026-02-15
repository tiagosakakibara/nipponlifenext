# Diagnóstico e Correções — Problemas de Login / Sessão

**Data:** 2026-02-11
**Projeto:** nipponlife-next (Next.js 16 + Supabase SSR + next-intl)

---

## Sintomas Relatados

1. **Deslogamento após Ctrl+R** — Após um refresh da página, o usuário perde a sessão ou é carregado com uma "conta fictícia" (perfil incorreto).
2. **Loop de loading no login** — Após a sessão cair, ao tentar fazer login novamente, a tela fica presa em "Entrando..." indefinidamente.

---

## Bug 1 — `getSession()` não valida com o servidor Supabase

### Arquivo
`src/contexts/AuthContext.tsx` (linha 85, antes da correção)

### O que estava errado
```ts
// CÓDIGO ANTIGO — PROBLEMÁTICO
const { data: { session } } = await supabase.auth.getSession();
const currentUser = session?.user ?? null;
```

`getSession()` lê o token JWT do armazenamento local do browser (cookie/memória) **sem fazer nenhuma requisição ao servidor** para validar se o token ainda é válido. Isso significa:

- Se o token expirou, `getSession()` pode retornar `null` (deslogando o usuário) mesmo que o `refresh_token` ainda seja válido e o middleware já tenha emitido um token novo.
- Se o cookie ficou corrompido entre o servidor (middleware) e o cliente, `getSession()` retorna dados desatualizados.

### A documentação do Supabase diz explicitamente:
> "`supabase.auth.getSession()` should never be used for authentication purposes. Use `getUser()` instead, which sends a request to the Supabase Auth server every time to revalidate the Auth token."

### Correção aplicada
O `initializeAuth()` foi removido. Agora `onAuthStateChange` é a **única fonte de verdade**. O Supabase SSR dispara o evento `INITIAL_SESSION` automaticamente ao montar o listener, validando a sessão com o servidor. Isso elimina a necessidade de `getSession()`.

```ts
// CÓDIGO NOVO — CORRETO
const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || ...) {
        const currentUser = session?.user ?? null;
        // ...
    }
});
```

---

## Bug 2 — Condição de corrida: `initializeAuth` vs `onAuthStateChange`

### Arquivo
`src/contexts/AuthContext.tsx` (linhas 100–117, antes da correção)

### O que estava errado
```ts
useEffect(() => {
    initializeAuth();  // ← inicia assíncrono, não aguardado

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        // ← dispara SIMULTANEAMENTE, incluindo SIGNED_IN/INITIAL_SESSION imediato
        if (event === 'SIGNED_IN') {
            const profile = await getProfile(currentUser); // ← concorrente com initializeAuth
            setAuthState({ user, profile, loading: false });
        }
    });
}, []);
```

Ao montar o `AuthProvider`:
1. `initializeAuth()` inicia uma chamada a `getSession()` + `getProfile()`
2. Simultaneamente, `onAuthStateChange` dispara `INITIAL_SESSION` ou `SIGNED_IN` e também chama `getProfile()`
3. **O que terminar por último "ganha"** e pode sobrescrever o estado com um perfil sintético (fallback) criado por `applyAdminOverride(null, user)` — gerando a impressão de uma "conta fictícia"

### Correção aplicada
Removido o `initializeAuth()` completamente. O evento `INITIAL_SESSION` do `onAuthStateChange` foi adicionado à lista de eventos tratados. Adicionado um `handledRef` para rastrear se a sessão já foi inicializada, com fallback de timeout de 3 segundos para redes lentas.

---

## Bug 3 — `router.push` + `router.refresh()` causa loop de loading no login

### Arquivo
`src/app/[locale]/login/components/LoginPageClient.tsx` (linhas 56–57, antes da correção)

### O que estava errado
```ts
// CÓDIGO ANTIGO — PROBLEMÁTICO
router.push(nextUrl);     // navega para /comunidade (assíncrono)
router.refresh();          // re-renderiza Server Components da página ATUAL (login)
```

No React 19 + Next.js 16, chamar `router.push()` e `router.refresh()` em sequência cria uma condição de corrida:

1. `router.push('/comunidade')` inicia navegação
2. `router.refresh()` força re-fetch dos Server Components da página de **login** (que está sendo abandonada)
3. O `AuthContext` re-monta com `loading: true`
4. Componentes protegidos detectam `loading: true` → exibem spinner → aguardam → nunca resolvem
5. O botão permanece em "Entrando..." indefinidamente

Esse problema é agravado quando há cookies Supabase corrompidos de uma sessão anterior, pois o `createBrowserClient` pode tentar processá-los antes de aceitar os novos cookies do login.

### Correção aplicada
```ts
// CÓDIGO NOVO — CORRETO
window.location.href = nextUrl;
```

`window.location.href` força uma navegação completa (full page reload), garantindo:
- Cookies frescos são enviados ao servidor desde o início
- O `AuthContext` inicializa do zero sem conflito de estado
- O middleware do Supabase SSR processa os cookies corretamente
- Sem condição de corrida entre navegação e refresh

---

## Bug 4 — Código de "legacy account linking" sobrescrevia perfis inesperadamente

### Arquivo
`src/app/auth/callback/route.ts` (bloco de ~70 linhas removido)

### O que estava errado
Havia um bloco de código que, quando um novo usuário logava via Google, tentava fazer um "matching heurístico" com contas admin/photographer existentes usando um sistema de pontuação baseado em username e nome completo:

```ts
// Score de compatibilidade (problemático):
// username igual = 10 pts
// username parecido = 5 pts
// full_name igual = 10 pts
// role admin = 3 pts
// Se score >= 8 → sobrescreve o perfil do usuário com dados de outro perfil!
```

**Problema**: Se qualquer usuário novo tivesse um username ou nome parecido com um admin/photographer existente, seu perfil seria silenciosamente substituído pelos dados de outra pessoa. Isso causava a "conta fictícia" para usuários novos: ao logar pela primeira vez com Google, eles poderiam ver o nome, role e dados de outro usuário.

### Correção aplicada
O bloco de legacy linking foi removido completamente. O account linking legítimo (detecção de email duplicado entre Google e email/password) foi preservado intacto, pois usa verificação determinística (emails idênticos) ao invés de heurística.

---

## Resumo das Correções

| Bug | Arquivo | Correção |
|-----|---------|---------|
| `getSession()` sem validação servidor | `AuthContext.tsx` | Removido `initializeAuth()`, usar apenas `onAuthStateChange` com `INITIAL_SESSION` |
| Condição de corrida na inicialização | `AuthContext.tsx` | `handledRef` + único fluxo de init |
| `router.push` + `router.refresh()` em conflito | `LoginPageClient.tsx` | `window.location.href` para full page reload |
| Legacy account linking sobrescrevia perfis | `auth/callback/route.ts` | Bloco removido |

---

## Fluxo Correto Após Correções

```
1. Login com email/password
   ↓ signInWithPassword() — seta cookies Supabase
   ↓ window.location.href = '/comunidade'
   ↓ Full page reload: browser envia cookies novos

2. Middleware (middleware.ts)
   ↓ updateSession() → getUser() valida com servidor
   ↓ Tokens renovados se necessário
   ↓ Cookies atualizados na resposta

3. AuthProvider monta
   ↓ onAuthStateChange registrado
   ↓ INITIAL_SESSION dispara com sessão válida
   ↓ getProfile() busca perfil real do banco
   ↓ setAuthState({ user, profile, loading: false })

4. Ctrl+R (refresh)
   ↓ Middleware valida sessão novamente com servidor
   ↓ onAuthStateChange INITIAL_SESSION dispara
   ↓ Sessão mantida ✓
```

---

## Como Verificar

1. **Login normal**: Entrar com email/password → deve navegar para `/pt/comunidade` sem travar
2. **Persistência**: Após login, pressionar Ctrl+R → deve permanecer logado com o perfil correto
3. **Re-login após logout**: Fazer logout → Ctrl+R → tentar login → não deve travar em "Entrando..."
4. **Login Google (novo usuário)**: Criar conta nova via Google → não deve sobrescrever perfil com dados de outro usuário

---

## Bug 5 — `createClient` (localStorage) dessincroniza com o middleware SSR

**Data:** 2026-02-15

### Arquivo
`src/lib/supabaseClient.ts`

### O que estava errado
```ts
// PROBLEMÁTICO — usa localStorage, não sincroniza com o middleware
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

O `@supabase/supabase-js` persiste a sessão em **localStorage**. O middleware (`utils/supabase/middleware.ts`) usa `createServerClient` do `@supabase/ssr`, que persiste em **cookies HTTP**. Os dois mecanismos não se comunicam: o middleware chamava `getUser()`, não encontrava sessão nos cookies, retornava `null` — sessão "sumia" a cada reload.

### Correção aplicada
```ts
// CORRETO — cookie-based, sincronizado com o middleware SSR
import { createBrowserClient } from '@supabase/ssr'
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
```

**Regra:** Em Next.js App Router com middleware Supabase SSR, o client-side DEVE usar `createBrowserClient` do `@supabase/ssr`. Nunca usar `createClient` do `@supabase/supabase-js` no client.

---

## Bug 6 — `async` no callback `onAuthStateChange` causa deadlock no SDK

**Data:** 2026-02-15

### Arquivo
`src/contexts/AuthContext.tsx`

### O que estava errado
```ts
// PROBLEMÁTICO — async direto trava o SDK
supabase.auth.onAuthStateChange(async (event, session) => {
    const profile = await getProfile(currentUser); // ← SDK aguarda isso terminar
    setAuthState({ user: currentUser, profile, loading: false });
});
```

O SDK Supabase aguarda o callback terminar antes de resolver a sessão internamente. Como o callback fazia `await` de `getProfile()` — que usa o mesmo cliente Supabase para query no banco — o SDK entrava em deadlock: esperava o callback, que esperava o SDK. Resultado: `INITIAL_SESSION` disparava com `user: null` mesmo com sessão válida → reload derrubava o login.

### Correção aplicada
```ts
// CORRETO — callback síncrono, trabalho assíncrono fora do ciclo do SDK
supabase.auth.onAuthStateChange((event, session) => {
    const currentUser = session?.user ?? null;

    if (!currentUser) {
        setAuthState({ user: null, profile: null, loading: false });
        return;
    }

    const fetchId = ++fetchIdRef.current;

    // Seta user imediatamente — UI não fica presa em loading
    setAuthState({ user: currentUser, profile: null, loading: true });

    // Despacha fora do callback para liberar o SDK
    setTimeout(() => {
        getProfile(currentUser).then((profile) => {
            if (mounted && fetchId === fetchIdRef.current) {
                setAuthState({ user: currentUser, profile, loading: false });
            }
        });
    }, 0);
});
```

**Regra:** O callback do `onAuthStateChange` NUNCA deve ser `async`. Todo trabalho assíncrono deve ser despachado via `setTimeout(fn, 0)` para liberar o ciclo interno do SDK.

---

## Resumo Atualizado das Correções

| Bug | Arquivo | Correção |
|-----|---------|---------|
| `getSession()` sem validação servidor | `AuthContext.tsx` | Removido `initializeAuth()`, usar apenas `onAuthStateChange` com `INITIAL_SESSION` |
| Condição de corrida na inicialização | `AuthContext.tsx` | `fetchIdRef` + único fluxo de init |
| `router.push` + `router.refresh()` em conflito | `LoginPageClient.tsx` | `window.location.href` para full page reload |
| Legacy account linking sobrescrevia perfis | `auth/callback/route.ts` | Bloco heurístico removido |
| `createClient` (localStorage) vs middleware (cookies) | `supabaseClient.ts` | Trocado para `createBrowserClient` do `@supabase/ssr` |
| `async` no callback `onAuthStateChange` | `AuthContext.tsx` | Callback síncrono + `setTimeout(fn, 0)` para trabalho assíncrono |
