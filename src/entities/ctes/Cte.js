import { BaseEntity } from '@/entities/BaseEntity';
import { CteStatus } from '@/entities/ctes/CteStatus';

export class Cte extends BaseEntity {
    constructor({
        id = null,
        companyId,
        status = CteStatus.UPLOADED,
    }) {
        if(!Object.values(CteStatus).includes(status)) {
            throw new Error('Invalid CTe status');
        }
        this.id = id
        this.companyId = companyId
        this.status = status
    }
}