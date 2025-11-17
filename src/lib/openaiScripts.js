import OpenAI from 'openai';
import { IA_MODELS } from '@/assets/iaModels';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function getGptResponse({ 
    model = IA_MODELS.gpt['5'].nano, 
    input, 
    maxOutputTokens
}){
    return await client.responses.create({
        model: model, 
        input: input,
        max_output_tokens: maxOutputTokens,
    });
}

export async function getEmbeddingResponse({
    model = IA_MODELS.openaiEmbeddings['3'].small,
    input
}){
    return await client.embeddings.create({
        model: model,
        input: input,
    });
}