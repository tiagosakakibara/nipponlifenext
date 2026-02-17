import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const signature = request.headers.get('x-komoju-signature');
        const rawBody = await request.text();
        const secret = process.env.KOMOJU_WEBHOOK_SECRET;

        // Verify signature if secret is provided
        if (secret && signature) {
            const hmac = crypto.createHmac('sha256', secret);
            const digest = hmac.update(rawBody).digest('hex');

            if (digest !== signature) {
                console.error('Invalid Komoju webhook signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const payload = JSON.parse(rawBody);
        const eventType = payload.type;
        const data = payload.data;

        console.log(`Received Komoju Webhook: ${eventType}`, data);

        // Handle specific event types
        if (eventType === 'payment.captured') {
            const externalOrderNum = data.external_order_num;
            const sessionId = data.session;
            const metadata = data.payment_data?.metadata;

            if (metadata?.user_id) {
                const supabase = await createClient();

                // Logic to update user subscription
                // Example:
                // await supabase.from('profiles').update({ is_premium: true }).eq('id', metadata.user_id);

                console.log(`Updating user ${metadata.user_id} to Premium`);
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
