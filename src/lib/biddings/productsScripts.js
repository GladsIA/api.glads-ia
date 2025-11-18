import { withRetry } from '@/lib/utils/retryScripts';
import { getEmbeddingResponse } from '@/lib/openaiScripts';

export async function buildProductRows(idClient, productsBatch) {
    const texts = productsBatch.map(p => buildProductText(p));
    const embeddingResponse = await withRetry(
        () => getEmbeddingResponse({ input: texts }),
        {
            retries: 4,
            retryOn: [429, 500], // rate limit e falhas temporárias
            baseDelay: 800
        }
    );
    const vectors = embeddingResponse.data.map(d => d.embedding);
    const rows = productsBatch.map((product, i) => ({
        idClient: idClient,
        idProduct: product.id,
        content: texts[i],
        embedding: vectors[i],
    }));
    return rows
}

function buildProductText(product) {
    const name = product.properties.name || '';
    const description = product.properties.description || '';
    return `
        Nome: ${name}
        Descrição: ${description}
    `.trim();
}