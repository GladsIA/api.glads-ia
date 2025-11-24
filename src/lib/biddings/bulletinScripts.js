import { insertRow } from '@/supabase/crud';

export function validateBulletin(body) {
    if(!body?.boletim) {
        throw new Error("Campo 'boletim' é obrigatório.");
    }
    if(!body?.licitacoes) {
        throw new Error("Campo 'licitacoes' é obrigatório.");
    }
    return { 
        bulletin: body.boletim,
        biddings: body.licitacoes
    }
}

export async function insertBulletin(bulletin) {
    return insertRow({
        table: 'autBiddings-bulletins',
        row: {
            idConlicitacao: bulletin.id,
            datetimeClosing: bulletin.datahora_fechamento,
            editionNumber: bulletin.numero_edicao,
            biddingsCount: bulletin.quantidade_licitacoes,
        }
    });
}