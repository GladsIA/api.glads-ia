import { supabase } from '@/supabase/client';
import { withRetry } from '@/lib/utils/retryScripts';

export async function getSimilarEmbeddings({
    funcName,
    embedding,
    minSimilarity = 0.7
}){
    const { data, error } = await supabase.rpc(
        funcName, {
            item_embedding: embedding,
            min_similarity: minSimilarity
        }
    );
    if(error) throw error;
    return data;
}

export async function insertRow({
    table,
    row
}){
    return withRetry(async () => {
        const { data, error } = await supabase
            .from(table)
            .insert(row)
            .select();
        if(error) throw error;
        return data?.[0] ?? true;
    },{
        retries: 4,
        retryOn: ['22P02', '40001', '53300'],
        baseDelay: 700
    });
}

export async function upsertRows({
    table,
    rows = [],
    onConflict
}){
    return withRetry(async () => {
        const { data, error } = await supabase
            .from(table)
            .upsert(rows, { onConflict })
            .select();
        if(error) throw error;
        return data;
    },{
        retries: 4,
        retryOn: ['22P02', '40001', '53300'], 
        baseDelay: 700
    });
}

export async function findOne({
    table,
    match = {},
    select = '*'
}) {
    return withRetry(async () => {
        const { data, error } = await supabase
            .from(table)
            .select(select)
            .match(match)
            .maybeSingle();
        if(error) throw error;
        return data ?? null;
    }, {
        retries: 4,
        retryOn: ['22P02', '40001', '53300'],
        baseDelay: 700
    });
}

export async function updateRow({
    table,
    match = {},
    row
}) {
    return withRetry(async () => {
        const { data, error } = await supabase
            .from(table)
            .update(row)
            .match(match)
            .select();
        if(error) throw error;
        return data?.[0] ?? null;
    }, {
        retries: 4,
        retryOn: ['22P02', '40001', '53300'],
        baseDelay: 700
    });
}

// 22P02: input inválido momentâneo
// 40001: serialization error
// 53300: too many connections