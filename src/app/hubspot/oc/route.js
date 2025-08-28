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
                objectTypeId, // O tipo de objeto (ex: '0-48' para email, '0-49' para nota)
                objectId,     // O ID do objeto específico
                undefined,    // properties
                undefined,    // propertiesWithHistory
                ['file'],     // Pede para incluir associações com arquivos
            );
            console.log('Detalhes do Objeto:', objectDetails);
            const attachments = objectDetails.associations?.files?.results;
            if(attachments && attachments.length > 0){
                console.log(`Encontrados ${attachments.length} anexos para o objeto ${objectId}.`);
                for (const attachment of attachments) {
                    const fileId = attachment.id;
                    const fileDetails = await hubspotClient.files.files.filesApi.getById(fileId);
                    const downloadUrl = fileDetails.url;
                    console.log(`--> Anexo: '${fileDetails.name}', URL: ${downloadUrl}`);
                }
            } else{
                console.log(`Nenhum anexo encontrado para o objeto ${objectId}.`);
            }

        } catch(e){
            console.error(`Erro ao processar o objeto ${objectId}:`, e.message || e);
        }
    }
    return NextResponse.json(
        { success: true, message: 'Webhook validated!' }, 
        { status: 200 }
    );
}