import { NextResponse } from 'next/server';

export async function POST(req){
    try {
        const contentType = req.headers.get('content-type') || '';
        if(!contentType.includes('multipart/form-data')){
            return NextResponse.json({ 
                error: 'Formato inválido. Use multipart/form-data' 
            }, { status: 400 });
        }
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Arquivo inválido. Apenas PDFs são permitidos.' }, { status: 400 });
        }

        // Converter para Buffer para futuras operações
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${file.name}"`,
            }
        });

    } catch(error){
        return NextResponse.json({ 
            error: 'Erro ao processar o arquivo.'
        }, { status: 500 });
    }
}