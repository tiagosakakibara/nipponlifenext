"use client";

import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Hook to access auth state from AuthContext.
 * This ensures all components share the same authentication state
 * and prevents redundant Supabase API calls.
 */
export function useAuth() {
    return useAuthContext();
}
