import { insertRow, updateRow, findOne, findMany, deleteRow } from '@/supabase/crud';

export class BaseRepository {

    constructor(table) {
        this.table = table;
    }

    async create(data) {
        const row = data?.toDatabase ? data.toDatabase() : data;
        return await insertRow({
            table: this.table,
            row
        });
    }

    async findById(id) {
        return await findOne({
            table: this.table,
            match: { id }
        });
    }

    async findOne(match) {
        return await findOne({
            table: this.table,
            match
        });
    }

    async findMany(match = {}) {
        return await findMany({
            table: this.table,
            match
        });
    }

    async updateById(id, data) {
        const row = data?.toDatabase ? data.toDatabase() : data;
        return await updateRow({
            table: this.table,
            match: { id },
            row
        });
    }

    async updateWhere(match, data) {
        const row = data?.toDatabase ? data.toDatabase() : data;
        return await updateRow({
            table: this.table,
            match,
            row
        });
    }

    async deleteById(id) {
        return await deleteRow({
            table: this.table,
            match: { id }
        });
    }

    async deleteWhere(match) {
        return await deleteRow({
            table: this.table,
            match
        });
    }

}