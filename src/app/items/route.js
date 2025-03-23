import { NextResponse } from 'next/server';

export async function OPTIONS() {
    return NextResponse.json({}, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*', // Permite qualquer origem (substitua pelo domínio específico se necessário)
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Arquivo inválido. Apenas PDFs são permitidos.' }, { 
                status: 400,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }

        return NextResponse.json({ message: `Arquivo "${file.name}" recebido com sucesso!` }, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao processar o arquivo." }, {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}