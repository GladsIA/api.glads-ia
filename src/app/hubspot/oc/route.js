import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    const signature = headers['x-hubspot-signature-v3'];
    const timestamp = headers['x-hubspot-request-timestamp'];
    const clientSecret = process.env.AUTOMACAO_OC_APP_HUBSPOT_CLIENT_SECRET;

    // --- CORREÇÃO DA URL PARA AMBIENTES DE TÚNEL (ngrok, etc.) ---
    const currentUrl = new URL(request.url);
    // O cabeçalho 'x-forwarded-host' é adicionado por proxies e túneis para indicar o host original.
    const publicHost = headers['x-forwarded-host'] || currentUrl.host;
    const correctUrl = `${currentUrl.protocol}//${publicHost}${currentUrl.pathname}${currentUrl.search}`;
    // --- FIM DA CORREÇÃO ---
    
    // Agora, construa a baseString com a URL correta
    const baseString = `${request.method}${correctUrl}${body}${timestamp}`;

    const hmac = crypto
        .createHmac('sha256', clientSecret)
        .update(baseString)
        .digest('base64');
    
    // Logs de verificação final
    console.log('--- FINAL VERIFICATION ---');
    console.log('Correct URL used for signature:', correctUrl);
    console.log('HUBSPOT Received Signature:', signature);
    console.log('GENERATED Local HMAC:    ', hmac); // Adicionei espaços para alinhar
    console.log('Signatures Match?:', hmac === signature);
    console.log('--------------------------');

    if (hmac !== signature) {
        // Mantenha a resposta de erro detalhada por enquanto
        return NextResponse.json(
            { 
                success: false, 
                message: 'Invalid signature.',
                details: {
                    received: signature,
                    generated: hmac,
                    urlUsed: correctUrl
                }
            },
            { status: 401 }
        );
    }
    
    // Webhook válido!
    console.log('Webhook validado com sucesso!');
    const parsed = JSON.parse(body);
    // ... sua lógica para processar os dados ...
    
    return NextResponse.json({ success: true, message: "Webhook validated!" }, { status: 200 });
}