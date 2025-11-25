import { NextResponse } from 'next/server';
import { insertBiddingRows } from '@/lib/biddings/insertBiddingsScripts';
import { initProcessBiddings } from '@/lib/biddings/processBiddingsScripts';
import { insertBulletin, validateBulletin } from '@/lib/biddings/bulletinScripts';

export async function POST(req) {
    try {
        const body = await req.json();
        const { bulletin, biddings } = validateBulletin(body);
        const insertedBulletin = await insertBulletin(bulletin);
        const insertedBiddings = await insertBiddingRows(insertedBulletin.id, biddings);
        const insertedComparisons = await initProcessBiddings(insertedBiddings);
        return NextResponse.json({ 
            bulletin: insertedBulletin,
            biddings: insertedBiddings,
            comparisons: insertedComparisons 
        }, { status: 200 });
    } catch(err) {
        console.error('Erro geral:', err);
        return NextResponse.json(
            { error: 'Erro ao processar licitações', details: err.message },
            { status: 500 }
        );
    }
}