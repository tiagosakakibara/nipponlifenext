# Security Test Plan - NipponLifeV1

This document outlines the security testing strategy for the NipponLifeV1 application, focusing on Authentication, Authorization (RLS), Storage, and Input Validation.

**Automated verification script**: `scripts/test_security_rls.ts` (Run via `npx tsx scripts/test_security_rls.ts`)
**Last Run Status**: ✅ 5/5 PASSED (RLS Policies Verified)

## 1. Authentication & Session Management

| ID | Test Case | Description | Expected Result | Status |
|----|-----------|-------------|-----------------|--------|
| **AUTH-01** | **Sign Up / Sign In (Email)** | Verify users can sign up and log in using email/password. | User is authenticated, JWT token received. | ⬜ |
| **AUTH-02** | **Social Login (Google)** | Verify login flow via Google OAuth provider. | User is redirected to provider and back, authenticated successfully. | ⬜ |
| **AUTH-03** | **Password Recovery** | Request password reset email. | Email sent, link allows password reset. | ⬜ |
| **AUTH-04** | **Session Persistence** | Refresh page after login. | User remains logged in. | ⬜ |
| **AUTH-05** | **Sign Out** | Click sign out button. | Session cleared, redirected to public pages. | ⬜ |
| **AUTH-06** | **Protected Routes** | precise access to `/admin` without being logged in. | Redirected to login page. | ⬜ |

## 2. Authorization (RLS & Roles)

Based on policies defined in `supabase_schema.sql`.

### 2.1 Admin Privileges

*Pre-condition: User exists in `public.admins` table.*

| ID | Test Case | Description | Expected Result | Status |
|----|-----------|-------------|-----------------|--------|
| **RLS-ADM-01** | **Admin Read All Posts** | Admin queries posts with `status='draft'`. | Posts are returned. | ⬜ |
| **RLS-ADM-02** | **Admin Create Category** | Admin attempts to insert a new category. | Insert successful. | ⬜ |
| **RLS-ADM-03** | **Admin Upload Media** | Admin attempts to upload file to `media` bucket. | Upload successful. | ⬜ |
| **RLS-ADM-04** | **Admin Delete Post** | Admin attempts to delete a post. | Delete successful. | ⬜ |

### 2.2 Public / Anonymous Refusals

| ID | Test Case | Description | Expected Result | Status |
|----|-----------|-------------|-----------------|--------|
| **RLS-PUB-01** | **Public Read Categories** | Anonymous user queries categories. | Categories returned. | ✅ |
| **RLS-PUB-02** | **Public Write Category** | Anonymous user attempts to insert category. | **Error: 403 Forbidden / RLS Policy Violation**. | ✅ |
| **RLS-PUB-03** | **Public Read Published Posts** | Anonymous user queries posts with `status='published'`. | Published posts returned. | ✅ |
| **RLS-PUB-04** | **Public Read Draft Posts** | Anonymous user queries posts with `status='draft'`. | No rows returned (Filtered out). | ✅ |
| **RLS-PUB-05** | **Public Upload Media** | Anonymous user attempts to upload to `media` bucket. | **Error: 403 Forbidden / RLS Policy Violation**. | ✅ |

### 2.3 Authenticated Non-Admin Refusals

*Pre-condition: User logs in but is NOT in `public.admins` table.*

| ID | Test Case | Description | Expected Result | Status |
|----|-----------|-------------|-----------------|--------|
| **RLS-USR-01** | **User Write Post** | Authenticated generic user attempts to insert post. | **Error: 403 Forbidden**. | ⬜ |
| **RLS-USR-02** | **User Read Drafts** | Authenticated generic user queries drafts. | No rows returned. | ⬜ |

## 3. Storage Security

| ID | Test Case | Description | Expected Result | Status |
|----|-----------|-------------|-----------------|--------|
| **STO-01** | **Public File Access** | Access a known existing file URL directly. | File loads (200 OK). | ⬜ |
| **STO-02** | **Unauthorized Delete** | Non-admin tries to delete a file via API. | **Error: 403 Forbidden**. | ⬜ |

## 4. Input Validation & Frontend Security

| ID | Test Case | Description | Expected Result | Status |
|----|-----------|-------------|-----------------|--------|
| **SEC-01** | **XSS in Comment (Textarea)** | Inject `<script>alert('xss')</script>` in comment field. | Tag displayed as plain text (React escaping). | ⬜ |
| **SEC-02** | **XSS in Admin Post (Quill)** | Inject script in Rich Text Editor. | Content sanitized before render (via `dompurify` or safe render). | ⬜ |
| **SEC-03** | **SQL Injection** | Attempt SQLi in inputs (e.g., search fields). | No SQL error, input treated as string. | ⬜ |

## 5. UI & Route Security (Manual / Cypress)

| ID | Test Case | Description | Expected Result | Status |
|----|-----------|-------------|-----------------|--------|
| **UI-01** | **Admin Route Guard** | Access `/admin` while logged out. | Redirect to `/admin/login`. | ⬜ |
| **UI-02** | **Admin Menu Visibility** | View public page while logged out. | Admin link in footer/header is Hidden. | ⬜ |
| **UI-03** | **Client-Side Auth State** | Check `localStorage` or cookies after logout. | Auth tokens are removed. | ⬜ |
