import { findOne } from '@/supabase/crud';
import { BaseRepository } from '@/repositories/BaseRepository';

export class UserRepository extends BaseRepository {

    constructor() {
        super('users');
    }

    async findByEmail(email) {
        return findOne({
            table: this.table,
            match: { email }
        });
    }

}