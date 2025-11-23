import { withRetry } from '@/lib/utils/retryScripts';
import { getEmbeddingResponse } from '@/lib/openaiScripts';

export async function buildBiddingRows(idBulletin, biddings) {
    const rows = await Promise.all(
        biddings.map(async bidding => {
            const rawItems = bidding.item
                .split('\n')
                .filter(i => i.trim() !== '');
            const items = [];
            for(const text of rawItems) {
                const embeddingResponse = await withRetry(
                    () => getEmbeddingResponse({ input: text }),
                    {
                        retries: 4,
                        retryOn: [429, 500],
                        baseDelay: 800
                    }
                );
                const embedding = embeddingResponse.data[0].embedding;
                items.push({ text, embedding });
            }
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
        })
    );
    return rows;    
}