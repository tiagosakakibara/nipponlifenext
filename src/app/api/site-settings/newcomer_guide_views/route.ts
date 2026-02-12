import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'newcomer_guide_views')
        .maybeSingle();

    if (error) {
        console.error('Error fetching newcomer_guide_views:', error.message);
        return NextResponse.json({ views: 0 });
    }

    // Return the value directly (assuming it's a number stored as JSONB)
    return NextResponse.json({ views: data?.value ?? 0 });
}

export async function POST() {
    // For incrementing views, we need to bypass RLS because anonymous users can't update settings
    // We use the service role key for this specific operation
    const supabaseService = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // Fetch current value first to increment it
        // Note: In high concurrency, this is not atomic. 
        // Ideally we would use an RPC function like 'increment_setting(key)' but for now this suffices.
        const { data: currentData } = await supabaseService
            .from('site_settings')
            .select('value')
            .eq('key', 'newcomer_guide_views')
            .maybeSingle();

        const currentViews = Number(currentData?.value) || 0;
        const newViews = currentViews + 1;

        const { error: upsertError } = await supabaseService
            .from('site_settings')
            .upsert({ key: 'newcomer_guide_views', value: newViews }, { onConflict: 'key' });

        if (upsertError) throw upsertError;

        return NextResponse.json({ views: newViews });
    } catch (error: any) {
        console.error('Error incrementing views:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
