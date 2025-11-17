import { supabase } from '@/supabase/client';
import { withRetry } from '@/lib/utils/retryScripts';

export async function upsertRows({
    table,
    rows = [],
    onConflict
}){
    return withRetry(
        async () => {
            const { error } = await supabase
                .from(table)
                .upsert(rows, { onConflict });
            if(error) throw error;
            return true;
        },{
            retries: 4,
            retryOn: ['22P02', '40001', '53300'], 
            // 22P02: input inválido momentâneo
            // 40001: serialization error
            // 53300: too many connections
            baseDelay: 700
        }
    );
}