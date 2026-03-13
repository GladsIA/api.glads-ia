import { findOne, exists } from '@/supabase/crud';
import { BaseRepository } from '@/repositories/BaseRepository';

export class OrganizationRepository extends BaseRepository {

    constructor() {
        super('organizations');
    }

    async findByCnpj(cnpj) {
        return findOne({
            table: this.table,
            match: { cnpj }
        });
    }

    async existsByCnpj(cnpj) {
        return exists({
            table: this.table,
            match: { cnpj }
        });
    }

}