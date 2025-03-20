import { supabase } from '@/libs/supabase';

export async function getBiddings(){
    const { data, error } = await supabase.from('licitacoes').select('*');
    if(error) throw new Error(error.message);
    return data;
}