import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function DELETE(request: NextRequest) {
    try {
        // 1. Verify user is authenticated and is admin
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 2. Get request data
        const { id, publicUrl } = await request.json()

        if (!id || !publicUrl) {
            return NextResponse.json({ error: 'Missing id or publicUrl' }, { status: 400 })
        }

        // 3. Delete from storage
        try {
            // Extract bucket and path from URL
            const parts = publicUrl.split('/public/')
            if (parts.length >= 2) {
                const subparts = parts[1].split('/')
                const bucket = subparts[0]
                const filePath = subparts.slice(1).join('/')

                const { error: storageError } = await supabase.storage
                    .from(bucket)
                    .remove([filePath])

                if (storageError) {
                    console.error('Storage delete error:', storageError)
                    // Continue anyway to delete from DB
                }
            }
        } catch (error) {
            console.error('Error parsing URL for storage deletion:', error)
            // Continue anyway to delete from DB
        }

        // 4. Delete from DB using service role to bypass RLS
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!serviceRoleKey || !supabaseUrl) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        const adminClient = createServiceClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        const { error: dbError } = await adminClient
            .from('media')
            .delete()
            .eq('id', id)

        if (dbError) {
            console.error('Database error:', dbError)
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
