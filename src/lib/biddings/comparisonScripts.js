import { getGptResponse } from '@/lib/openaiScripts';

function getComparisonPrompt(item, product) {
    return `
        Compare cuidadosamente a descrição do item no edital com as especificações técnicas de um produto.
        Compare:
            Item da licitação:
            '${item.text}'
            Produto:
            '${product.content}'
            A similaridade por embbeding deu: ${product.similarity}
        Em seguida, produza uma análise clara e objetiva com o seguinte formato:
        {
            "differences": [
                "Liste as principais diferenças encontradas entre o item e o produto, como divergência em marca, modelo, dimensões, materiais, requisitos normativos, certificações, condições de entrega, garantias, etc.",
                "Cada diferença deve ser clara e direta, mencionando o que foi dito em cada fonte"
            ],
            "finalSimilarity": 0.0,
            "conclusion": "Uma frase ou pequeno parágrafo resumindo as conclusões da análise"
        }
        - "finalSimilarity" deve ser um número entre 0 e 100 (sem %). Ele deve ser decidido levando em conta o resultado da similaridade por embedding e pela análise textual de ambos os elementos. De preferencia, deve ser um número sem casas decimais.
        - Seja objetivo e técnico, sem emitir juízo de valor.
        - Se os itens forem praticamente idênticos, indique isso de forma clara e mantenha a similaridade próxima de 100%.
        - A resposta deve estar estritamente no formato JSON acima, sem comentários ou explicações adicionais.
    `;
}

export async function getAllComparisons(item, products) {
    const comparisons = await Promise.all(
        products.map(async product => {
            return await getComparison(item, product);
        })
    );
    return comparisons;
}

async function getComparison(item, product) {
    const prompt = getComparisonPrompt(item, product);
    const response = await getGptResponse({
        input: prompt,
    });
    const text = response.output_text.trim();
    let json;
    try {
        json = JSON.parse(text);
    } catch(err) {
        console.error('Erro ao parsear JSON da IA:', text);
        return {
            differences: [],
            finalSimilarity: 0,
            conclusion: 'Falha ao interpretar resposta da IA.'
        };
    }
    return {
        differences: Array.isArray(json.differences) ? json.differences : [],
        finalSimilarity: typeof json.finalSimilarity === 'number' ? json.finalSimilarity : 0,
        conclusion: json.conclusion || ''
    };
}