import { isValidHubspotSignature } from '@/lib/oc';
import { Client } from '@hubspot/api-client';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const body = await request.text();
    const isValid = await isValidHubspotSignature(request, body);
    if(!isValid){
        return NextResponse.json(
            { success: false, message: 'Invalid signature.' },
            { status: 401 }
        );
    }
    const events = JSON.parse(body);
    const hubspotClient = new Client({ 
        accessToken: process.env.AUTOMACAO_OC_APP_HUBSPOT_ACCESS_TOKEN
    });

    return NextResponse.json(
        { success: true, message: 'Webhook validated!' }, 
        { status: 200 }
    );
}