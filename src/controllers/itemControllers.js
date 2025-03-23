import { NextResponse } from 'next/server';

export async function handlePostItems(req){
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, {
                status: 400,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }

        return NextResponse.json({
            message: `Arquivo "${file.name}" recebido com sucesso!`
        }, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch(error){
        return NextResponse.json({ error: "Erro ao processar o arquivo." }, {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}