import { getSimilarEmbeddings } from '@/supabase/crud';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const bidding = await req.json();
        if(!bidding) {
            return NextResponse.json(
                { error: 'JSON não enviado' },
                { status: 400 }
            );
        }
        const embeddings = bidding.itemsEmbeddings;
        embeddings.map(async embedding => {
            const products = await getSimilarEmbeddings({
                funcName: 'get_similar_products',
                embedding: embedding,
            });
            
        });

        // return NextResponse.json({
        // ok: true,
        // mensagem: 'Embeddings processados com sucesso',
        // total: resultados.length,
        // resultados
        // });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
        { error: err.message },
        { status: 500 }
        );
    }
}