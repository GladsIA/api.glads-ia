import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        
        if (!file || file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Arquivo inválido. Apenas PDFs são permitidos.' }, { status: 400 });
        }
        
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${file.name}"`
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao processar o arquivo.' }, { status: 500 });
    }
}