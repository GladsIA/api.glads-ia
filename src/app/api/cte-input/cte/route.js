import { NextResponse } from 'next/server';
import { Cte } from '@/entities/ctes/Cte';
import { CteRepository } from '@/repositories/cteRepository';

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, companyId } = body;
        if(!userId || !companyId) {
            return NextResponse.json(
                { error: 'userId, companyId are required' },
                { status: 400 }
            )
        }
        const cte = new Cte({
            userId,
            companyId,
        });
        const cteRepository = new CteRepository();
        const data = await cteRepository.create(cte);
        const savedCte = Cte.fromDatabase(data);
        return NextResponse.json(
            { cte: savedCte }, 
            { status: 201 }
        );
    } catch(error) {
        console.error('Create cte error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}