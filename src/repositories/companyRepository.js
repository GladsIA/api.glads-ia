import { insertRow, updateRow, findOne } from '@/supabase/crud';

export const companyRepository = {
  
    async create(company) {
        return await insertRow({
            table: 'companies',
            row: company.toDatabase()
        });
    },

    async findById(id) {
        return await findOne({
            table: 'companies',
            match: { id }
        });
    },

    async update(id, data) {
        return await updateRow({
            table: 'companies',
            match: { id },
            row: data
        });
    },
};