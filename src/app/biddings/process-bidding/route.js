import { NextResponse } from 'next/server';
import { getSimilarEmbeddings } from '@/supabase/crud';
import { getAllComparisons } from '@/lib/biddings/comparisonScripts';

export async function POST(req) {
    try {
        const bidding = await req.json();
        if(!bidding) {
            return NextResponse.json(
                { error: 'JSON não enviado' },
                { status: 400 }
            );
        }
        const results = [];
        await Promise.all(
            bidding.items.map(async (item, i) => {
                const products = await getSimilarEmbeddings({
                    funcName: 'get_similar_products',
                    embedding: item.embedding,
                });
                const comparisons = await getAllComparisons(item, products);
                comparisons.map((comparison, j) => {
                    results.push({
                        idBulletin: bidding.idBulletin,
                        idBidding: bidding.id,
                        itemIndex: i,
                        item: item.text,
                        idProduct: products[j].idProduct,
                        product: products[j].content,
                        embeddingSimilarity: products[j].similarity,
                        finalSimilarity: comparison.finalSimilarity,
                        differences: comparison.differences,
                        conclusion: comparison.conclusion
                    });
                })
            })
        );
        return NextResponse.json({
            ok: true,
            results
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
        { error: err.message },
        { status: 500 }
        );
    }
}