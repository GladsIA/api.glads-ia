export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { isValidHubspotSignature, processEvent } from '@/lib/oc';

export async function POST(request) {
    const body = await request.text();
    if(!await isValidHubspotSignature(request, body)) {
        return NextResponse.json({
            success: false,
            message: 'Invalid signature.'
        }, { status: 401 });
    }

    const events = JSON.parse(body);
    for(const event of events) {
        await processEvent(event);
    }

    return NextResponse.json({ 
        success: true,
        message: 'Webhook processado' 
    }, { status: 200 });
}