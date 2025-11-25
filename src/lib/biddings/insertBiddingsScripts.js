import { withRetry } from '@/lib/utils/retryScripts';
import { getEmbeddingResponse } from '@/lib/openaiScripts';
import { upsertRows } from '@/supabase/crud';

export async function insertBiddingRows(idBulletin, biddings) {
    const rows = await buildBiddingRows(idBulletin, biddings);
    return await upsertRows({
        table: 'autBiddings-biddings',
        rows,
        onConflict: 'idConlicitacao'
    });
}

async function buildBiddingRows(idBulletin, biddings) {
    return Promise.all(
        biddings.map(async bidding => {
            const rawItems = extractItems(bidding.item);
            const items = await buildItemsWithEmbeddings(rawItems);
            return buildBiddingObject(idBulletin, bidding, items);
        })
    );
}

function extractItems(text) {
    return text
        .split('\n')
        .map(t => t.trim())
        .filter(Boolean);
}

async function generateEmbedding(text) {
    const response = await withRetry(() => getEmbeddingResponse({ input: text }), { 
        retries: 4, 
        retryOn: [429, 500], 
        baseDelay: 800 
    });
    return response.data[0].embedding;
}

async function buildItemsWithEmbeddings(rawItems) {
    return Promise.all(
        rawItems.map(async text => {
            const embedding = await generateEmbedding(text);
            return { text, embedding };
        })
    );
}

function buildBiddingObject(idBulletin, bidding, items) {
    return {
        idBulletin,
        idConlicitacao: bidding.id,
        process: bidding.processo,
        biddingCode: bidding.edital,
        uf: bidding.orgao.uf,
        city: bidding.orgao.cidade,
        address: bidding.orgao.endereco,
        agency: bidding.orgao.nome,
        phones: bidding.orgao.telefone,
        site: bidding.orgao.site,
        object: bidding.objeto,
        datetimeOpening: bidding.datahora_abertura,
        datetimeDeadline: bidding.datahora_prazo,
        items,
        valueEstimated: bidding.valor_estimado,
        urlDocuments: bidding.documento
    };
}