import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(request){
    const headers = Object.fromEntries(request.headers.entries());
    const body = await request.text();
    console.log('HUBSPOT → webhook HIT', { headers, body });
    const signature = headers['x-hubspot-signature-v3'];
    const timestamp = headers['x-hubspot-request-timestamp'];
    console.log('HUBSPOT → signature', signature);
    console.log('HUBSPOT → timestamp', timestamp);
    const clientSecret = process.env.AUTOMACAO_OC_APP_HUBSPOT_CLIENT_SECRET;
    const baseString = `v3/${timestamp}/${body}`;
    const hmac = crypto
        .createHmac('sha256', clientSecret)
        .update(baseString)
        .digest('base64');
    console.log('HUBSPOT → hmac', hmac);
    if(hmac !== signature){
        return NextResponse.json(
            { success: false, message: 'Invalid signature' },
            { status: 401 }
        );
    }
    const parsed = JSON.parse(body);
    console.log('Webhook válido →', parsed);
    return NextResponse.json(
        { success: true, message: 'Route successfully called' }, 
        { status: 200 }
    );
}