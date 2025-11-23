import { NextResponse } from 'next/server';
import { upsertRows } from '@/supabase/crud';
import { buildBiddingRows } from '@/lib/biddings/biddingScripts';

export async function POST(req) {
    try {
        const { idBulletin, biddings } = await req.json();
        if(!idBulletin) {
            return NextResponse.json(
                { error: "Campo 'idBulletin' é obrigatório." },
                { status: 400 }
            );
        }
        if(!biddings || !Array.isArray(biddings)) {
            return NextResponse.json(
                { error: "Campo 'biddings' é obrigatório e precisa ser um array." },
                { status: 400 }
            );
        }
        const rows = await buildBiddingRows(idBulletin, biddings);
        await upsertRows({
            table: 'autBiddings-biddings',
            rows,
            onConflict: 'idConlicitacao'
        });
        return NextResponse.json({ biddings: rows }, { status: 200 });
    } catch(err) {
        console.error('Erro geral:', err);
        return NextResponse.json(
            { error: 'Erro ao processar licitações', details: err.message },
            { status: 500 }
        );
    }
}