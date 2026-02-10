'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

/**
 * Lists all orphaned images in storage that are not referenced in the database
 */
export async function listOrphanedImages() {
    const supabase = await createClient()

    // Verify caller is admin
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey || !supabaseUrl) {
        return { success: false, error: 'Server configuration error' }
    }

    try {
        const adminClient = createServiceClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // Get all files from storage
        const { data: storageFiles, error: storageError } = await adminClient
            .storage
            .from('media')
            .list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } })

        if (storageError) {
            console.error('Error listing storage files:', storageError)
            return { success: false, error: 'Failed to list storage files' }
        }

        // Get all registered media from database
        const { data: dbMedia, error: dbError } = await adminClient
            .from('media')
            .select('path, public_url')

        if (dbError) {
            console.error('Error fetching database media:', dbError)
            return { success: false, error: 'Failed to fetch database media' }
        }

        // Extract filenames from database URLs
        const registeredFiles = new Set(
            dbMedia?.map(m => {
                const url = m.public_url || m.path
                const parts = url.split('/')
                return parts[parts.length - 1]
            }) || []
        )

        // Find orphaned files
        const orphanedFiles = storageFiles?.filter(file =>
            !registeredFiles.has(file.name)
        ) || []

        return {
            success: true,
            orphanedFiles: orphanedFiles.map(f => ({
                name: f.name,
                size: f.metadata?.size || 0,
                created_at: f.created_at
            })),
            totalOrphaned: orphanedFiles.length,
            totalInStorage: storageFiles?.length || 0,
            totalInDatabase: dbMedia?.length || 0
        }
    } catch (error: any) {
        console.error('Unexpected error:', error)
        return { success: false, error: `Erro inesperado: ${error.message}` }
    }
}

/**
 * Deletes a specific file from storage
 */
export async function deleteOrphanedImage(filename: string) {
    const supabase = await createClient()

    // Verify caller is admin
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey || !supabaseUrl) {
        return { success: false, error: 'Server configuration error' }
    }

    try {
        const adminClient = createServiceClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        const { error } = await adminClient
            .storage
            .from('media')
            .remove([filename])

        if (error) {
            console.error('Error deleting file:', error)
            return { success: false, error: `Failed to delete file: ${error.message}` }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Unexpected error:', error)
        return { success: false, error: `Erro inesperado: ${error.message}` }
    }
}
