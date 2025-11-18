import { NextResponse } from 'next/server';
import { upsertRows } from '@/supabase/crud';
import { processInBatches } from '@/lib/utils/batchScripts';
import { buildProductRows } from '@/lib/biddings/productsScripts';

const idClient = '36c88f95-b4fa-4512-8380-a16fc4f2af1b';

export async function POST(req) {
    try {
        const { products } = await req.json();
        if(!products || !Array.isArray(products)) {
            return NextResponse.json(
                { error: "Campo 'products' é obrigatório e precisa ser um array." },
                { status: 400 }
            );
        }
        const batchSize = 200;
        let totalInserted = 0;
        const results = await processInBatches(products, batchSize, async (productsBatch, batchNumber) => {
            console.log(`Processando batch ${batchNumber} com ${productsBatch.length} produtos...`);
            const rows = await buildProductRows(idClient, productsBatch);
            await upsertRows({
                table: 'autBiddings-products',
                rows,
                onConflict: 'idProduct'
            });
            totalInserted += rows.length;
            console.log(`Batch ${batchNumber} finalizado: ${rows.length} registros`);
            return { 
                batch: batchNumber, 
                inserted: rows.length 
            };
        });
        return NextResponse.json({
            success: true,
            totalInserted,
            batches: results.length,
            details: results
        });
    } catch(err) {
        console.error('Erro geral:', err);
        return NextResponse.json(
            { error: 'Erro ao processar embeddings', details: err.message },
            { status: 500 }
        );
    }
}