import { BaseEntity } from '@/entities/BaseEntity';

export class Organization extends BaseEntity {
    constructor({ name, cnpj }) {
        super();
        this.name = name;
        this.cnpj = cnpj;
    }
}