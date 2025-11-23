import { supabase } from '@/supabase/client';

export async function POST(req) {
    const body = await req.json();
    const { embedding, minSimilarity = 0.70 } = body;
    const { data, error } = await supabase.rpc(
        'get_similar_products', {
            item_embedding: embedding,
            min_similarity: minSimilarity
        }
    );
    if(error) {
        return Response.json(
            { error }, 
            { status: 400 }
        );
    }
    return Response.json({ results: data });
}