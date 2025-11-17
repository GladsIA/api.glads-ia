import { getAllComparisons } from '@/lib/biddings/comparisonScripts';

export async function POST(req) {
    const { item, products } = await req.json();
    const results = await getAllComparisons(item, products);
    return Response.json({ results });
}