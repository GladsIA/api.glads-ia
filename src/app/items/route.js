import { NextResponse } from 'next/server';

export async function POST(req){
    try {
        const formData = await req.formData(); // Extrai os dados da requisição
        const file = formData.get('file'); // Obtém o arquivo enviado

        if (!file || file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Arquivo inválido. Apenas PDFs são permitidos.' }, { status: 400 });
        }

        return NextResponse.json({ message: `Arquivo "${file.name}" recebido com sucesso!` });
    } catch(error){
        return NextResponse.json({ 
            error: 'Erro ao processar o arquivo.'
        }, { status: 500 });
    }
}