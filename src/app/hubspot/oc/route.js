export const runtime = 'nodejs';

import { isValidHubspotSignature } from '@/lib/oc';
import { NextResponse } from 'next/server';

const HUBSPOT_TOKEN = process.env.AUTOMACAO_OC_APP_HUBSPOT_ACCESS_TOKEN;

async function hubspotFetch(path, opts = {}) {
  const url = `https://api.hubapi.com${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${HUBSPOT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    ...opts
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, body: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, body: text }; }
}

export async function POST(request) {
  const body = await request.text();
  if (!await isValidHubspotSignature(request, body)) {
    return NextResponse.json({ success: false, message: 'Invalid signature.' }, { status: 401 });
  }

  const events = JSON.parse(body);
  for (const event of events) {
    if (event.subscriptionType !== 'object.creation') {
      console.log(`Evento ignorado (tipo: ${event.subscriptionType}).`);
      continue;
    }

    const objectId = event.objectId;
    const objectTypeId = event.objectTypeId; // ex: 'emails' ou '0-48' dependendo do subscription

    try {
      // busca o objeto pedindo properties e associations=files
      const q = `/crm/v3/objects/${encodeURIComponent(objectTypeId)}?properties=hs_attachment_ids&associations=files`;
      const resp = await hubspotFetch(q, { method: 'GET' });

      if (!resp.ok) {
        console.error(`Erro ao buscar objeto ${objectId}: ${resp.status} -`, resp.body);
        continue;
      }
      console.log(`Detalhes do Objeto (REST) ${objectId}:`, JSON.stringify(resp.body, null, 2));

      // 1) attachments pelas associations (mais confiável)
      const attachmentsFromAssociations = resp.body?.associations?.files?.results;
      if (attachmentsFromAssociations && attachmentsFromAssociations.length > 0) {
        console.log(`Encontrados ${attachmentsFromAssociations.length} anexos (associations) para o objeto ${objectId}.`);
        for (const att of attachmentsFromAssociations) {
          const fileId = att.id;
          const fileResp = await hubspotFetch(`/files/v3/files/${fileId}`);
          if (!fileResp.ok) {
            console.error(`Erro ao buscar file ${fileId}: ${fileResp.status} -`, fileResp.body);
            continue;
          }
          console.log(`--> Anexo (assoc): id=${fileId}, name='${fileResp.body.name}', url=${fileResp.body.url || '(sem url)'} `);
        }
        continue;
      }

      // 2) fallback: hs_attachment_ids property
      const hsAttachmentIds = resp.body?.properties?.hs_attachment_ids || '';
      if (hsAttachmentIds) {
        const ids = hsAttachmentIds.split(';').map(s => s.trim()).filter(Boolean);
        console.log(`hs_attachment_ids: ${ids.join(', ')}`);
        for (const fileId of ids) {
          const signedResp = await hubspotFetch(`/files/v3/files/${fileId}/signed-url?expirationSeconds=300`);
          if (!signedResp.ok) {
            console.error(`Erro ao obter signed-url ${fileId}: ${signedResp.status} -`, signedResp.body);
            continue;
          }
          console.log(`--> Signed-url para ${fileId}:`, signedResp.body.signedUrl || signedResp.body);
        }
      } else {
        console.log(`Nenhum anexo encontrado para o objeto ${objectId}.`);
      }
    } catch (err) {
      console.error(`Erro ao processar o objeto ${objectId}:`, err?.stack || err);
    }
  }

  return NextResponse.json({ success: true, message: 'Webhook processed' }, { status: 200 });
}