import crypto from 'crypto';

const HUBSPOT_CLIENT_SECRET = process.envAUTOMACAO_OC_APP_HUBSPOT_CLIENT_SECRET;
const HUBSPOT_ACCESS_TOKEN = process.env.AUTOMACAO_OC_APP_HUBSPOT_ACCESS_TOKEN;

export async function isValidHubspotSignature(request, body) {
    const headers = Object.fromEntries(request.headers.entries());
    const signature = headers['x-hubspot-signature-v3'];
    const timestamp = headers['x-hubspot-request-timestamp'];
    if (!signature || !timestamp || !HUBSPOT_CLIENT_SECRET) {
        console.error('Cabeçalhos de assinatura do HubSpot ou segredo do cliente ausentes.');
        return false;
    }
    const currentUrl = new URL(request.url);
    const publicHost = headers['x-forwarded-host'] || currentUrl.host;
    const correctUrl = `${currentUrl.protocol}//${publicHost}${currentUrl.pathname}${currentUrl.search}`;
    const baseString = `${request.method}${correctUrl}${body}${timestamp}`;
    const hmac = crypto
        .createHmac('sha256', HUBSPOT_CLIENT_SECRET)
        .update(baseString)
        .digest('base64');
    const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
    if(!isValid){
        console.warn('Falha na validação da assinatura do HubSpot.');
        console.log('URL usada para assinatura:', correctUrl);
        console.log('Assinatura recebida do HubSpot:', signature);
        console.log('HMAC local gerado:', hmac);
    }
    return isValid;
}

export async function processEvent(event) {
    console.log('Processando evento:', JSON.stringify(event, null, 2));
    if (event.subscriptionType !== 'object.creation') {
        console.log(`Evento ignorado (tipo: ${event.subscriptionType}).`);
        return;
    }
    const { objectId, objectTypeId } = event;
    try {
        if(objectTypeId === 'files' || objectTypeId === 'file') {
            await processFileEvent(objectId);
        } else {
            await processCrmObject(objectId, objectTypeId);
        }
    } catch(err) {
        console.error(`Erro inesperado ao processar o objeto ${objectId}:`, err?.stack || err);
    }
}

async function processFileEvent(fileId) {
    console.log(`Evento de FILE detectado. Consultando Files API para ${fileId}`);
    const fileResp = await hubspotFetch(`/files/v3/files/${encodeURIComponent(fileId)}`);
    if(!fileResp.ok) {
        console.error(`Erro ao buscar file ${fileId}: ${fileResp.status} -`, fileResp.body);
        return;
    }
    console.log(`Metadados do File:`, JSON.stringify(fileResp.body, null, 2));
}

async function processCrmObject(objectId, objectTypeId) {
    const path = `/crm/v3/objects/${encodeURIComponent(objectTypeId)}/${encodeURIComponent(objectId)}?properties=hs_attachment_ids&associations=files`;
    const resp = await hubspotFetch(path);
    if(!resp.ok) {
        console.error(`Erro ao buscar objeto ${objectTypeId}/${objectId}: ${resp.status} -`, resp.body);
        return;
    }
    console.log(`Detalhes do Objeto ${objectTypeId}/${objectId}:`, JSON.stringify(resp.body, null, 2));
    const crmObject = resp.body;
    const attachmentsFromAssociations = crmObject?.associations?.files?.results;
    const hsAttachmentIds = crmObject?.properties?.hs_attachment_ids;
    if(attachmentsFromAssociations && attachmentsFromAssociations.length > 0) {
        await processAttachmentsFromAssociations(attachmentsFromAssociations);
    } 
    else if(hsAttachmentIds) {
        await processAttachmentsFromProperty(hsAttachmentIds);
    } else {
        console.log(`Nenhum anexo encontrado para o objeto ${objectId}.`);
    }
}

async function hubspotFetch(path, opts = {}) {
    const url = `https://api.hubapi.com${path}`;
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        ...opts
    });
    const text = await res.text();
    try {
        return { 
            ok: res.ok, 
            status: res.status, 
            body: JSON.parse(text) 
        };
    } catch {
        return { 
            ok: res.ok, 
            status: res.status, 
            body: text 
        };
    }
}

async function processAttachmentsFromAssociations(attachments) {
    console.log(`Encontrados ${attachments.length} anexos (via associations).`);
    for(const att of attachments) {
        const fileId = att.id;
        const fileResp = await hubspotFetch(`/files/v3/files/${fileId}`);
        if(!fileResp.ok) {
            console.error(`Erro ao buscar metadados do file ${fileId}: ${fileResp.status} -`, fileResp.body);
            continue;
        }
        console.log(`--> Anexo (assoc): id=${fileId}, name='${fileResp.body.name}', url=${fileResp.body.url || '(sem url)'}`);
    }
}

async function processAttachmentsFromProperty(attachmentIdsString) {
    const ids = attachmentIdsString.split(';').map(s => s.trim()).filter(Boolean);
    if(ids.length === 0) return;
    console.log(`Encontrados ${ids.length} anexos (via hs_attachment_ids): ${ids.join(', ')}`);
    for(const fileId of ids) {
        const signedResp = await hubspotFetch(`/files/v3/files/${fileId}/signed-url?expirationSeconds=300`);
        if (!signedResp.ok) {
            console.error(`Erro ao obter signed-url para o file ${fileId}: ${signedResp.status} -`, signedResp.body);
            continue;
        }
        console.log(`--> URL assinada para ${fileId}:`, signedResp.body.signedUrl || signedResp.body);
    }
}