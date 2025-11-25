import { getSimilarEmbeddings, upsertRows } from '@/supabase/crud';
import { getAllComparisons } from '@/lib/biddings/comparisonScripts';

export async function initProcessBiddings(insertedBiddings) {
    const matrixResults = await Promise.all(
        insertedBiddings.map(processBidding)
    );
    const flatRows = matrixResults.flat(2);
    await insertComparisonRows(flatRows);
    return flatRows;
}

async function insertComparisonRows(rows) {
    return await upsertRows({
        table: 'autBiddings-comparisons',
        rows
    });
}

async function processBidding(insertedBidding) {
    return await Promise.all(
        insertedBidding.items.map(async (item, index) => {
            const enrichedItem = { ...item, index };
            return await processItem(enrichedItem, insertedBidding);
        })
    );
}

async function processItem(item, insertedBidding) {
    const products = await getSimilarEmbeddings({
        funcName: 'get_similar_products',
        embedding: item.embedding
    });
    const comparisons = await getAllComparisons(item, products);
    return comparisons.map((comparison, j) => ({
        idBulletin: insertedBidding.idBulletin,
        idBidding: insertedBidding.id,
        itemIndex: item.index,
        item: item.text,
        idProduct: products[j].idProduct,
        product: products[j].content,
        embeddingSimilarity: products[j].similarity,
        finalSimilarity: comparison.finalSimilarity,
        differences: comparison.differences,
        conclusion: comparison.conclusion
    }));
}

function flattenResults(m) {
    return m.flat(1);
}