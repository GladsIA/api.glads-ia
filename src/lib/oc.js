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

export async function processHubspotEvent(hubspotClient, event) {
    if(event.subscriptionType !== 'object.creation') {
        console.log(`Evento ignorado (tipo: ${event.subscriptionType}).`);
        return;
    }
    try {
        const objectDetails = await getObjectDetails(hubspotClient, event);
        const attachments = objectDetails.associations?.files?.results;
        if(attachments && attachments.length > 0) {
            console.log(`Encontrados ${attachments.length} anexos para o objeto ${event.objectId}.`);
            await Promise.all(
                attachments.map(attachment => processAttachment(hubspotClient, attachment))
            );
        } else {
            console.log(`Nenhum anexo encontrado para o objeto ${event.objectId}.`);
        }
    } catch (e) {
        console.error(`Erro ao processar o objeto ${event.objectId}:`, e.message || e);
    }
}

async function getObjectDetails(hubspot, event) {
    try {
        const objectId = event.objectId;
        const objectTypeId = event.objectTypeId;
        const objectDetails = await hubspot.crm.objects.basicApi.getById(objectTypeId, objectId, ['hs_attachment_ids']);
        console.log('Detalhes do Objeto:', objectDetails);
        return objectDetails;
    } catch(err) {
        throw new Error(`getObjectDetails failed: ${err?.message || err}`);
    }
}

async function processAttachment(hubspotClient, attachment) {
    try {
        const fileId = attachment.id;
        const fileDetails = await hubspotClient.files.files.filesApi.getById(fileId);
        const downloadUrl = fileDetails.url;
        console.log(`--> Anexo encontrado: '${fileDetails.name}', URL: ${downloadUrl}`);
    } catch(e) {
        console.error(`Erro ao processar o anexo ID ${attachment.id}:`, e.message || e);
    }
}