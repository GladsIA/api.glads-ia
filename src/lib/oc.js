import crypto from 'crypto';

export async function isValidHubspotSignature(request, body) {
    const headers = Object.fromEntries(request.headers.entries());
    const signature = headers['x-hubspot-signature-v3'];
    const timestamp = headers['x-hubspot-request-timestamp'];
    const clientSecret = process.env.AUTOMACAO_OC_APP_HUBSPOT_CLIENT_SECRET;
    if (!signature || !timestamp || !clientSecret) {
        console.error('Missing HubSpot signature headers or client secret.');
        return false;
    }
    const currentUrl = new URL(request.url);
    const publicHost = headers['x-forwarded-host'] || currentUrl.host;
    const correctUrl = `${currentUrl.protocol}//${publicHost}${currentUrl.pathname}${currentUrl.search}`;
    const baseString = `${request.method}${correctUrl}${body}${timestamp}`;
    const hmac = crypto
        .createHmac('sha256', clientSecret)
        .update(baseString)
        .digest('base64');
    const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
    if(!isValid){
        console.warn('HubSpot signature validation failed.');
        console.log('Correct URL used for signature:', correctUrl);
        console.log('HUBSPOT Received Signature:', signature);
        console.log('GENERATED Local HMAC:', hmac);
    }
    return isValid;
}