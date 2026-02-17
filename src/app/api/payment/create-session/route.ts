import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // In a real application, you would validate the order details here
        // const body = await request.json(); 

        // Komoju API Configuration
        const komojuSecretKey = process.env.KOMOJU_SECRET_KEY;

        if (!komojuSecretKey) {
            console.warn('KOMOJU_SECRET_KEY is not set. Using mock mode.');
            // Return a mock session for development if no key is present
            return NextResponse.json({
                id: 'mock_session_' + Date.now(),
                session_url: '/pagamento/sucesso?mock=true' // Redirect to success page directly for mock
            });
        }

        // Create Komoju Session
        const response = await fetch('https://komoju.com/api/v1/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(komojuSecretKey + ':').toString('base64')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: 1000, // ¥1,000 JPY
                currency: 'JPY',
                return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pagamento/retorno`,
                external_order_num: `order_${Date.now()}_${user.id.substring(0, 8)}`,
                payment_data: {
                    metadata: {
                        user_id: user.id,
                        plan: 'premium_monthly'
                    }
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Komoju API Error: ${JSON.stringify(errorData)}`);
        }

        const session = await response.json();

        return NextResponse.json({
            id: session.id,
            session_url: session.session_url
        });

    } catch (error: any) {
        console.error('Error creating payment session:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
