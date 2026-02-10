'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
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

    // 2. Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey || !supabaseUrl) {
        console.error('Missing environment variables:', {
            hasUrl: !!supabaseUrl,
            hasKey: !!serviceRoleKey
        })
        return { success: false, error: 'Server configuration error: Missing environment variables' }
    }

    try {
        // Create admin client with service role for bypassing RLS
        const adminClient = createServiceClient(
            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        console.log(`Starting deletion process for user ${userId}`)

        // Step 1: Delete all related data using admin client to bypass RLS

        // Delete community cost of living entries
        const { error: costError } = await adminClient
            .from('community_cost_of_living_entries')
            .delete()
            .eq('user_id', userId)

        if (costError) {
            console.error('Error deleting cost of living entries:', costError)
            // Don't return here, continue with other deletions
        } else {
            console.log('Deleted cost of living entries')
        }

        // Delete community posts
        const { error: postsError } = await adminClient
            .from('community_posts')
            .delete()
            .eq('created_by', userId)

        if (postsError) {
            console.error('Error deleting community posts:', postsError)
        } else {
            console.log('Deleted community posts')
        }

        // Delete community answers
        const { error: answersError } = await adminClient
            .from('community_answers')
            .delete()
            .eq('user_id', userId)

        if (answersError) {
            console.error('Error deleting community answers:', answersError)
        } else {
            console.log('Deleted community answers')
        }

        // Delete community questions
        const { error: questionsError } = await adminClient
            .from('community_questions')
            .delete()
            .eq('user_id', userId)

        if (questionsError) {
            console.error('Error deleting community questions:', questionsError)
        } else {
            console.log('Deleted community questions')
        }

        // Delete posts created by user
        const { error: userPostsError } = await adminClient
            .from('posts')
            .delete()
            .eq('created_by', userId)

        if (userPostsError) {
            console.error('Error deleting posts:', userPostsError)
        } else {
            console.log('Deleted posts')
        }

        // Delete gallery photos
        const { error: photosError } = await adminClient
            .from('gallery_photos')
            .delete()
            .eq('uploaded_by', userId)

        if (photosError) {
            console.error('Error deleting gallery photos:', photosError)
        } else {
            console.log('Deleted gallery photos')
        }

        // Delete comments
        const { error: commentsError } = await adminClient
            .from('comments')
            .delete()
            .eq('user_id', userId)

        if (commentsError) {
            console.error('Error deleting comments:', commentsError)
        } else {
            console.log('Deleted comments')
        }

        console.log('Related data cleanup completed')

        // Step 2: Delete user from auth using REST API
        const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('Error deleting user via REST API:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            })
            return {
                success: false,
                error: `Erro ao excluir usuário: ${errorData.message || response.statusText}`
            }
        }

        console.log('User deleted from auth successfully')

        // Step 3: Verify profile was deleted (should happen via CASCADE)
        const { data: profileCheck } = await adminClient
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle()

        if (profileCheck) {
            console.warn('Profile still exists after user deletion, attempting manual cleanup')
            // Manually delete profile if cascade didn't work
            await adminClient.from('profiles').delete().eq('id', userId)
        }

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('Unexpected error during user deletion:', error)
        return { success: false, error: `Erro inesperado: ${error.message}` }
    }
}

