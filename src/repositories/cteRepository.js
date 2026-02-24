import { insertRow, updateRow } from '@/supabase/crud'

export class CteRepository {

    async create(cte) {
        return await insertRow({
            table: 'ctes',
            row: cte.toDatabase()
        });
    }

    async updateStatus(cteId, newStatus) {
        return await updateRow({
            table: 'ctes',
            match: { id: cteId }, 
            row: { 
                status: newStatus,
                updated_at: new Date().toISOString()
            }
        });
    }
}