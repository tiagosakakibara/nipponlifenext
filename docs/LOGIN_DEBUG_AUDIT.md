# Login Debug Audit Report

## Root Cause Summary

**Issue:** "Email logins are disabled" error after auth refactor

### Discovered Issues (Fixed)

1. **Wrong API Key Format (CODE FIX - DONE)**
   - `.env.local` was using the new "publishable" key format: `sb_publishable_...`
   - This format is NOT compatible with the Supabase JavaScript SDK for email/password auth
   - Fixed by replacing with the legacy JWT-based anon key: `eyJhbG...`

2. **Email Provider Disabled in Supabase Dashboard (PENDING - REQUIRES MANUAL ACTION)**
   - The Supabase Auth logs confirm that the Email provider has been disabled
   - Last successful login was on 2026-01-17 (yesterday)
   - Current requests return: `error_code: email_provider_disabled`
   - **This must be re-enabled in the Supabase Dashboard**

---

## Action Required: Enable Email Provider

1. Go to: **[Supabase Dashboard](https://supabase.com/dashboard/project/sprkrjirfabsffrghdpo/auth/providers)**
2. Navigate to: **Authentication → Providers → Email**
3. Ensure **"Enable Email provider"** toggle is ON
4. Click **Save**

---

## Code Changes Made

### 1. Fixed `.env.local` (CRITICAL)
- Replaced publishable key with legacy JWT anon key
- The JWT key is required for `signInWithPassword()` to work

### 2. Created `src/lib/validateSupabaseEnv.ts`
- Validates env vars at startup
- Detects wrong key format (publishable vs JWT)
- Logs clear error messages in development

### 3. Created `src/components/dev/SupabaseDiagnostics.tsx`
- Dev-only diagnostics widget shown on login page
- Shows:
  - Supabase project host
  - Whether URL and key are configured
  - Key type (legacy-jwt vs publishable)
  - Current session status
- "Copy Diagnostics" button for easy troubleshooting
- **Never displays the actual anon key**

### 4. Updated `src/lib/supabaseClient.ts`
- Integrates with validation utility
- Removes partial key logging (security improvement)
- Only logs project host in development

### 5. Updated `src/pages/auth/LoginPage.tsx`
- Better error handling for "Email logins are disabled"
- Shows dev-only diagnostic hints
- Includes SupabaseDiagnostics widget on login page

### 6. Created `.env.example`
- Documents correct env var format
- Warns about publishable key incompatibility

---

## Verification Checklist

After enabling Email provider in Supabase Dashboard:

- [ ] Run `npm run dev`
- [ ] Navigate to `/login`
- [ ] Check diagnostics panel shows "Key Type: legacy-jwt"
- [ ] Attempt login with existing credentials
- [ ] Verify successful redirect after login
- [ ] Test logout functionality
- [ ] Test signup functionality at `/cadastro`
- [ ] Verify session persists on page refresh

---

## Technical Details

### Why Publishable Keys Don't Work for Auth

The new Supabase publishable keys (`sb_publishable_...`) are designed for:
- Data operations (CRUD)
- Realtime subscriptions
- Storage access

They are **not compatible** with the Auth SDK's `signInWithPassword()` method, which requires the legacy JWT-based anon key for:
- Token exchange
- Session management
- OAuth flows

### Auth Logs Analysis

```
2026-01-17 15:57:45 - STATUS 200 - Login SUCCESS (email provider)
2026-01-18 07:04:07 - STATUS 422 - email_provider_disabled
2026-01-18 07:08:54 - STATUS 422 - email_provider_disabled
```

The Email provider was working on Jan 17 and disabled sometime before Jan 18 07:04.

---

## Regression Prevention

The following safeguards are now in place:

1. **Startup Validation:** `assertSupabaseEnv()` throws descriptive errors in dev if config is wrong
2. **Key Type Detection:** The validation utility specifically checks for publishable key format
3. **Diagnostics Widget:** Provides immediate visibility into configuration issues
4. **Documentation:** `.env.example` explains the correct key format

---

Report generated: 2026-01-18T16:09:00+09:00
