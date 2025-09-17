import { NextResponse } from 'next/server';
import { Client } from '@hubspot/api-client';
import { isValidHubspotSignature, processHubspotEvent } from '@/lib/oc';

export async function POST(request) {
    try {
        const body = await request.text();
        const isValid = await isValidHubspotSignature(request, body);
        if (!isValid) {
            return NextResponse.json(
                { success: false, message: 'Invalid signature.' },
                { status: 401 }
            );
        }
        const events = JSON.parse(body);
        const hubspotClient = new Client({
            accessToken: process.env.AUTOMACAO_OC_APP_HUBSPOT_ACCESS_TOKEN
        });
        await Promise.all(
            events.map(event => processHubspotEvent(hubspotClient, event))
        );
        return NextResponse.json(
            { success: true, message: 'Webhook received and processing initiated.' },
            { status: 200 }
        );
    } catch(e) {
        console.error('Erro fatal no processamento do webhook:', e.message || e);
        return NextResponse.json(
            { success: false, message: 'An internal server error occurred.' },
            { status: 500 }
        );
    }
}