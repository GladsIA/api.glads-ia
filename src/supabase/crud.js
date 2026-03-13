import { supabase } from '@/supabase/client';
import { withRetry } from '@/lib/utils/retryScripts';

// export async function getSimilarEmbeddings({
//     funcName,
//     embedding,
//     minSimilarity = 0.7
// }){
//     const { data, error } = await supabase.rpc(
//         funcName, {
//             item_embedding: embedding,
//             min_similarity: minSimilarity
//         }
//     );
//     if(error) throw error;
//     return data;
// }

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

export async function insertRows({
    table,
    rows = []
}) {
    return withRetry(async () => {
        if(!rows.length) return [];
        const { data, error } = await supabase
            .from(table)
            .insert(rows)
            .select();
        if(error) throw error;
        return data ?? [];
    }, {
        retries: 4,
        retryOn: ['22P02', '40001', '53300'],
        baseDelay: 700
    });
}

export async function upsertRow({
    table,
    row,
    onConflict
}) {
    return withRetry(async () => {
        const { data, error } = await supabase
            .from(table)
            .upsert(row, { onConflict })
            .select();

        if(error) throw error;
        return data?.[0] ?? null;
    }, {
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

export async function findMany({
    table,
    match = {},
    select = '*'
}) {
    return withRetry(async () => {
        let query = supabase
            .from(table)
            .select(select);
        if(Object.keys(match).length > 0) {
            query = query.match(match);
        }
        const { data, error } = await query;
        if(error) throw error;
        return data ?? [];
    }, {
        retries: 4,
        retryOn: ['22P02', '40001', '53300'],
        baseDelay: 700
    });
}

export async function findManyOrdered({
    table,
    match = {},
    select = '*',
    orderBy,
    ascending = true
}) {
    return withRetry(async () => {
        let query = supabase
            .from(table)
            .select(select);
        if(Object.keys(match).length > 0) {
            query = query.match(match);
        }
        if(orderBy) {
            query = query.order(orderBy, { ascending });
        }
        const { data, error } = await query;
        if(error) throw error;
        return data ?? [];
    }, {
        retries: 4,
        retryOn: ['22P02', '40001', '53300'],
        baseDelay: 700
    });
}

export async function findByIds({
    table,
    ids = [],
    select = '*'
}) {
    return withRetry(async () => {
        if(!ids.length) return [];
        const { data, error } = await supabase
            .from(table)
            .select(select)
            .in('id', ids);
        if(error) throw error;
        return data ?? [];
    }, {
        retries: 4,
        retryOn: ['22P02', '40001', '53300'],
        baseDelay: 700
    });
}

export async function paginate({
    table,
    match = {},
    select = '*',
    page = 1,
    pageSize = 20
}) {
    return withRetry(async () => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        let query = supabase
            .from(table)
            .select(select, { count: 'exact' })
            .range(from, to);
        if(Object.keys(match).length > 0) {
            query = query.match(match);
        }
        const { data, error, count } = await query;
        if(error) throw error;
        return {
            data: data ?? [],
            count: count ?? 0,
            page,
            pageSize
        };
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

export async function updateRows({
    table,
    match = {},
    rows = []
}) {
    return withRetry(async () => {
        if(!rows.length) return [];
        const { data, error } = await supabase
            .from(table)
            .update(rows)
            .match(match)
            .select();
        if(error) throw error;
        return data ?? [];
    }, {
        retries: 4,
        retryOn: ['22P02', '40001', '53300'],
        baseDelay: 700
    });
}

export async function deleteRow({
    table,
    match = {}
}) {
    return withRetry(async () => {
        const { data, error } = await supabase
            .from(table)
            .delete()
            .match(match)
            .select();
        if(error) throw error;
        return data ?? [];
    }, {
        retries: 4,
        retryOn: ['22P02', '40001', '53300'],
        baseDelay: 700
    });
}

export async function exists({
    table,
    match = {}
}) {
    return withRetry(async () => {
        const { data, error } = await supabase
            .from(table)
            .select('id')
            .match(match)
            .limit(1);
        if(error) throw error;
        return (data?.length ?? 0) > 0;
    }, {
        retries: 4,
        retryOn: ['22P02', '40001', '53300'],
        baseDelay: 700
    });
}

export async function count({
    table,
    match = {}
}) {
    return withRetry(async () => {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
            .match(match);
        if(error) throw error;
        return count ?? 0;
    }, {
        retries: 4,
        retryOn: ['22P02', '40001', '53300'],
        baseDelay: 700
    });
}

// 22P02: input inválido momentâneo
// 40001: serialization error
// 53300: too many connections