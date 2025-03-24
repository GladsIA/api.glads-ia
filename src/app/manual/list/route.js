import { OpenAI } from 'openai';
import { handleCors } from '@/controllers/corsControllers';

export { handleCors as OPTIONS };

export async function POST(req){
    const selectedApiKey = process.env.OPENAI_GENERAL_KEY;
    if(!selectedApiKey){
        return new Response(JSON.stringify({ error: 'Chave de API inválida ou não configurada' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    const body = await req.json();
    const { messages } = body;
    const openai = new OpenAI({
        apiKey: selectedApiKey,
    });
    try{
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.0,
        });
        return new Response(JSON.stringify({ text: completion.choices[0]?.message?.content || '' }), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // Permite requisições de qualquer origem
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS", // Métodos permitidos
                "Access-Control-Allow-Headers": "Content-Type", // Headers permitidos
            },
        });
    }catch(error){
        console.error('Erro ao conectar à API da OpenAI: ', error);
        return new Response(JSON.stringify({ error: 'Erro ao conectar à API da OpenAI' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// export async function getResponseOpenai({ apiKey, messages, model }){
//     try{
//         const response = await fetch('/api/openai', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ 
//                 apiKey: apiKey,
//                 messages: messages,
//                 model: model
//             })
//         });
//         if(!response.ok){
//             throw new Error('Erro na requisição: ' + response.statusText);
//         }
//         const result = await response.json();
//         return result.text || '';
//     }catch(error){
//         console.error('Erro ao obter a resposta do OpenAI:', error);
//         throw error;
//     }
// }