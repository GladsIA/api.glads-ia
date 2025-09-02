import { isValidHubspotSignature } from '@/lib/oc';
import { Client } from '@hubspot/api-client';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // importante: força Node runtime no Next/Vercel

export async function POST(request) {
  const body = await request.text();
  const isValid = await isValidHubspotSignature(request, body);
  if (!isValid) {
    return NextResponse.json({ success: false, message: 'Invalid signature.' }, { status: 401 });
  }

  const events = JSON.parse(body);
  const hubspotClient = new Client({
    accessToken: process.env.AUTOMACAO_OC_APP_HUBSPOT_ACCESS_TOKEN
  });

  for (const event of events) {
    if (event.subscriptionType !== 'object.creation') {
      console.log(`Evento ignorado (tipo: ${event.subscriptionType}).`);
      continue;
    }
    const objectId = event.objectId;
    const objectTypeId = event.objectTypeId;

    try {
      const objectDetails = await hubspotClient.crm.objects.basicApi.getById(
        objectTypeId,
        objectId,
        ['hs_attachment_ids'],
        null,
        ['files']
      );

      // log completo para debugging
      console.log('Detalhes do Objeto (raw):', JSON.stringify(objectDetails, null, 2));

      const attachmentsFromAssociations = objectDetails.associations?.files?.results;
      if (attachmentsFromAssociations && attachmentsFromAssociations.length > 0) {
        for (const att of attachmentsFromAssociations) {
          const fileId = att.id;
          try {
            // Use fetch direto para evitar problemas do SDK em produção
            const res = await fetch(`https://api.hubapi.com/files/v3/files/${fileId}`, {
              headers: { Authorization: `Bearer ${process.env.AUTOMACAO_OC_APP_HUBSPOT_ACCESS_TOKEN}` }
            });
            if (!res.ok) {
              const text = await res.text();
              console.error(`Erro ao buscar file ${fileId}: ${res.status} - ${text}`);
              continue;
            }
            const fileMeta = await res.json();
            console.log(`--> Anexo: '${fileMeta.name}', url: ${fileMeta.url || '(sem url)'}; id: ${fileId}`);
          } catch (errFetch) {
            console.error(`Erro fetch arquivo ${fileId}:`, errFetch?.stack || errFetch);
          }
        }
        continue;
      }

      // fallback: hs_attachment_ids
      const hsAttachmentIds = objectDetails?.properties?.hs_attachment_ids || '';
      if (hsAttachmentIds) {
        const ids = hsAttachmentIds.split(';').map(s => s.trim()).filter(Boolean);
        for (const fileId of ids) {
          try {
            const res = await fetch(`https://api.hubapi.com/files/v3/files/${fileId}/signed-url?expirationSeconds=300`, {
              headers: { Authorization: `Bearer ${process.env.AUTOMACAO_OC_APP_HUBSPOT_ACCESS_TOKEN}` }
            });
            if (!res.ok) {
              const text = await res.text();
              console.error(`Erro ao obter signed-url para ${fileId}: ${res.status} - ${text}`);
              continue;
            }
            const signed = await res.json();
            console.log(`--> Signed-url para ${fileId}:`, signed.signedUrl || signed);
          } catch (err) {
            console.error(`Erro ao obter signed-url ${fileId}:`, err?.stack || err);
          }
        }
      } else {
        console.log(`Nenhum anexo encontrado para o objeto ${objectId}.`);
      }
    } catch (e) {
      // log completo da stack para entender se é do SDK
      console.error(`Erro ao processar o objeto ${objectId}:`, e?.stack || e);
    }
  }

  return NextResponse.json({ success: true, message: 'Webhook validated!' }, { status: 200 });
}