import { BaseEntity } from '@/entities/BaseEntity';

export class User extends BaseEntity {
    constructor({ id, companyId, name, email }) {
        super();
        this.id = id;
        this.companyId = companyId;
        this.name = name;
        this.email = email;
    }
}