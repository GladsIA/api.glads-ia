import { NextResponse } from 'next/server';
import { getBiddings } from '@/services/biddingService';

export async function handleGetBiddings(){
    try {
        const data = await getBiddings();
        return NextResponse.json(data);
    } catch(error){
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}