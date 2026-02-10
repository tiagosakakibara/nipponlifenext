'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function deleteUserAction(userId: string) {
    const supabase = await createClient()

    // 1. Verify caller is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Forbidden: Admin access required' }
    }

    // 2. Perform deletion using Admin Client
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
        console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
        return { success: false, error: 'Server configuration error: Service Role Key missing' }
    }

    const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    const { error } = await adminClient.auth.admin.deleteUser(userId)

    if (error) {
        console.error('Error deleting user:', error)
        return { success: false, error: error.message }
    }

    // Revalidate the page (path pattern might be locale dependent, but Next.js usually handles this if we revalidate generic path or just rely on client refresh)
    // We'll rely on client-side refresh for immediate feedback

    return { success: true }
}
