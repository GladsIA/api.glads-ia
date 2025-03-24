import { extractTextFromPDF } from '@/scripts/pdfScripts';
import { NextResponse } from 'next/server';

export const runtime = "nodejs"; // Garante que a API rode no ambiente Node.js

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
        }

        // 📌 Converte o arquivo para ArrayBuffer antes de enviar para a função
        const arrayBuffer = await file.arrayBuffer();

        // 📌 Agora passamos um ArrayBuffer em vez do File diretamente
        const extractedText = await extractTextFromPDF(arrayBuffer);

        return NextResponse.json({ extractedText });
    } catch (error) {
        console.error("Erro ao processar o arquivo:", error);
        return NextResponse.json({ error: "Erro ao processar o arquivo." }, { status: 500 });
    }
}
