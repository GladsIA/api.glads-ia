import { getGptResponse } from '@/lib/gptScripts';

function getComparisonPrompt(item, product) {
    return `
        Você é um classificador de similaridade.
        Compare:
            Produto:
            '${product.name}'
            Item da licitação:
            '${item.name}'
        Retorne APENAS um número entre 0 e 1 representando a similaridade.
        Sem palavras, sem frases, somente o número.
    `;
}

export async function getAllComparisons(item, products) {
    const comparisons = await Promise.all(
        products.map(async (product) => {
            const similarity = await getComparison(item, product);
            return {
                productId: product.id,
                name: product.name,
                similarity,
            };
        })
    );
    return {
        item: item.name,
        comparisons: comparisons
    };
}

async function getComparison(item, product) {
    const prompt = getComparisonPrompt(item, product)
    const response = await getGptResponse({
        input: prompt,
    });
    console.log(response);
    const raw = response.output_text.match(/[\d.,]+/g)?.[0] ?? '0';
    const similarity = parseFloat(raw.replace(',', '.'));
    return isNaN(similarity) ? 0 : similarity;
}