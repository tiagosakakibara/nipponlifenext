import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
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

        // 2. Get form data
        const formData = await request.formData()
        const file = formData.get('file') as File
        const albumId = formData.get('albumId') as string

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        if (!albumId) {
            return NextResponse.json({ error: 'Album ID required' }, { status: 400 })
        }

        // 3. Upload to storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `gallery/${fileName}`

        const fileBuffer = await file.arrayBuffer()
        const { error: uploadError } = await supabase.storage
            .from('gallery')
            .upload(filePath, fileBuffer, {
                contentType: file.type,
                upsert: false
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return NextResponse.json({ error: uploadError.message }, { status: 500 })
        }

        const { data: { publicUrl } } = supabase.storage
            .from('gallery')
            .getPublicUrl(filePath)

        // 4. Record in DB using service role to bypass RLS
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!serviceRoleKey || !supabaseUrl) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        const adminClient = createServiceClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        const { data, error: dbError } = await adminClient
            .from('gallery_photos')
            .insert([{
                album_id: albumId,
                user_id: user.id,
                image_url: publicUrl,
                title: file.name.split('.')[0],
                status: 'published'
            }])
            .select()
            .single()

        if (dbError) {
            console.error('Database error:', dbError)
            // Try to clean up the uploaded file
            await supabase.storage.from('gallery').remove([filePath])
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        return NextResponse.json({
            id: data.id,
            image_url: data.image_url,
            title: data.title,
            status: data.status,
            created_at: data.created_at
        })

    } catch (error: any) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
