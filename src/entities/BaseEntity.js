export class BaseEntity {
    constructor() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    static toSnakeCase(str) {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }

    static toCamelCase(str) {
        return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    toDatabase() {
        const dbObject = {};
        Object.keys(this).forEach((key) => {
            const snakeKey = BaseEntity.toSnakeCase(key);
            dbObject[snakeKey] = this[key];
        });
        return dbObject;
    }

    static fromDatabase(row) {
        const instance = new this({});
        Object.keys(row).forEach((key) => {
            const camelKey = BaseEntity.toCamelCase(key);
            instance[camelKey] = row[key];
        });
        return instance;
    }
}