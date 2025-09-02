export const runtime = 'nodejs';

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
    for(const event of events){
        if(event.subscriptionType !== 'object.creation'){
            console.log(`Evento ignorado (tipo: ${event.subscriptionType}).`);
            continue;
        }
        const objectId = event.objectId;
        const objectTypeId = event.objectTypeId;
        try {
            const objectDetails = await hubspotClient.crm.objects.basicApi.getById(
                objectTypeId,           // tipo do objeto (ex: 'notes', 'emails', ou id tipo)
                objectId,               // id do objeto
                ['hs_attachment_ids'],  // properties
                null,                   // propertiesWithHistory (null)
                ['files']               // associations -> importante
            );
            console.log('Detalhes do Objeto:', objectDetails);
            const attachmentsFromAssociations = objectDetails.associations?.files?.results;
            if(attachmentsFromAssociations && attachmentsFromAssociations.length > 0){
                console.log(`Encontrados ${attachmentsFromAssociations.length} anexos (associations) para o objeto ${objectId}.`);
                for (const att of attachmentsFromAssociations) {
                    const fileId = att.id;
                    // Use a Files API diretamente via apiRequest para garantir o endpoint
                    const fileMeta = await hubspotClient.apiRequest({ path: `/files/v3/files/${fileId}` });
                    console.log(`--> Anexo: '${fileMeta.name}', url: ${fileMeta.url || '(sem url direta)'}; full:`, fileMeta);
                }
                continue;
            }

            // 2) Se não vier associations, fallback para checar a propriedade hs_attachment_ids
            const hsAttachmentIds = objectDetails?.properties?.hs_attachment_ids || '';
            if (hsAttachmentIds) {
                const ids = hsAttachmentIds.split(';').map(s => s.trim()).filter(Boolean);
                console.log(`hs_attachment_ids: ${ids.join(', ')}`);
                for (const fileId of ids) {
                try {
                    // Tenta gerar signed URL (recomendado para download)
                    const signed = await hubspotClient.apiRequest({
                        path: `/files/v3/files/${fileId}/signed-url?expirationSeconds=300`
                    });
                    console.log(`--> Anexo (from hs_attachment_ids): ${fileId} signed-url:`, signed.signedUrl || signed);
                } catch(err){
                    console.error(`Erro ao obter file ${fileId}:`, err?.message || err);
                }
                }
            } else{
                console.log(`Nenhum anexo encontrado para o objeto ${objectId}.`);
            }

        } catch (e) {
            console.error(`Erro ao processar o objeto ${objectId}:`, e?.message || e);
        }
    }
    return NextResponse.json(
        { success: true, message: 'Webhook validated!' }, 
        { status: 200 }
    );
}