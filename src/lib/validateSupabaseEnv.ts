/**
 * Supabase Environment Variable Validation
 * 
 * This module validates that all required Supabase environment variables
 * are properly configured. It runs at app startup and provides clear
 * error messages for troubleshooting.
 */

export interface SupabaseEnvValidation {
    isValid: boolean;
    supabaseUrl: string | undefined;
    hasAnonKey: boolean;
    keyType: 'legacy-jwt' | 'publishable' | 'unknown' | 'missing';
    errors: string[];
    warnings: string[];
}

/**
 * Validates Supabase environment variables.
 * Call this at app startup to catch configuration issues early.
 */
export function validateSupabaseEnv(): SupabaseEnvValidation {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check URL
    if (!supabaseUrl) {
        errors.push('NEXT_PUBLIC_SUPABASE_URL is not defined. Check your .env.local file.');
    } else if (!supabaseUrl.includes('supabase.co')) {
        warnings.push('NEXT_PUBLIC_SUPABASE_URL does not appear to be a valid Supabase URL.');
    }

    // Check Anon Key
    let keyType: SupabaseEnvValidation['keyType'] = 'missing';

    if (!anonKey) {
        errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined. Check your .env.local file.');
    } else if (anonKey.startsWith('sb_publishable_')) {
        keyType = 'publishable';
        errors.push(
            'NEXT_PUBLIC_SUPABASE_ANON_KEY is using the new "publishable" key format (sb_publishable_...).\n' +
            'This format is NOT compatible with email/password authentication.\n' +
            'Please use the legacy JWT-based anon key instead.\n' +
            'Go to: Supabase Dashboard → Settings → API → "anon public" key'
        );
    } else if (anonKey.startsWith('eyJ')) {
        keyType = 'legacy-jwt';
        // Valid JWT format
    } else {
        keyType = 'unknown';
        warnings.push('NEXT_PUBLIC_SUPABASE_ANON_KEY format is unrecognized. Make sure you\'re using the correct key.');
    }

    const isValid = errors.length === 0;

    return {
        isValid,
        supabaseUrl,
        hasAnonKey: !!anonKey,
        keyType,
        errors,
        warnings,
    };
}

/**
 * Logs validation results to console.
 * Only logs detailed info in development mode.
 */
export function logSupabaseEnvValidation(validation: SupabaseEnvValidation): void {
    if (process.env.NODE_ENV !== 'development') {
        // In production, only log critical errors
        if (!validation.isValid) {
            console.error('[Supabase Config] Configuration errors detected. Check your environment variables.');
        }
        return;
    }

    console.group('[Supabase Config] Environment Validation');

    // URL info (safe to log)
    if (validation.supabaseUrl) {
        try {
            const url = new URL(validation.supabaseUrl);
            console.log('Project URL:', url.host);
        } catch {
            console.log('Project URL:', validation.supabaseUrl);
        }
    } else {
        console.log('Project URL:', 'NOT SET');
    }

    // Key info (never log the actual key)
    console.log('Anon Key:', validation.hasAnonKey ? '✓ Set' : '✗ Missing');
    console.log('Key Type:', validation.keyType);

    // Errors
    if (validation.errors.length > 0) {
        console.group('%c⚠️ Errors', 'color: red; font-weight: bold');
        validation.errors.forEach(err => console.error(err));
        console.groupEnd();
    }

    // Warnings
    if (validation.warnings.length > 0) {
        console.group('%c⚡ Warnings', 'color: orange');
        validation.warnings.forEach(warn => console.warn(warn));
        console.groupEnd();
    }

    // Success
    if (validation.isValid) {
        console.log('%c✓ Configuration valid', 'color: green; font-weight: bold');
    }

    console.groupEnd();
}

/**
 * Runs validation and throws if critical errors are found.
 * Use this in the Supabase client initialization.
 */
export function assertSupabaseEnv(): void {
    const validation = validateSupabaseEnv();
    logSupabaseEnvValidation(validation);

    if (!validation.isValid && process.env.NODE_ENV === 'development') {
        // In dev, throw to make the error obvious
        throw new Error(
            'Supabase configuration is invalid:\n' +
            validation.errors.join('\n')
        );
    }
}
