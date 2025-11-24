import { NextResponse } from 'next/server';
import { insertBiddingRows } from '@/lib/biddings/biddingScripts';
import { insertBulletin, validateBulletin } from '@/lib/biddings/bulletinScripts';

export async function POST(req) {
    try {
        const body = await req.json();
        const { bulletin, biddings } = validateBulletin(body);
        const insertedBulletin = await insertBulletin(bulletin);
        await insertBiddingRows(insertedBulletin.id, biddings);
        return NextResponse.json({ biddings: 'ok' }, { status: 200 });
    } catch(err) {
        console.error('Erro geral:', err);
        return NextResponse.json(
            { error: 'Erro ao processar licitações', details: err.message },
            { status: 500 }
        );
    }
}