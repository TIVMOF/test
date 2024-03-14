import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface Entity55534Entity {
    readonly Id: number;
    Name?: string;
}

export interface Entity55534CreateEntity {
    readonly Name?: string;
}

export interface Entity55534UpdateEntity extends Entity55534CreateEntity {
    readonly Id: number;
}

export interface Entity55534EntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
    },
    $select?: (keyof Entity55534Entity)[],
    $sort?: string | (keyof Entity55534Entity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface Entity55534EntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<Entity55534Entity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class Entity55534Repository {

    private static readonly DEFINITION = {
        table: "emo_ENTITY55534",
        properties: [
            {
                name: "Id",
                column: "ENTITY55534_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "ENTITY55534_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(Entity55534Repository.DEFINITION, null, dataSource);
    }

    public findAll(options?: Entity55534EntityOptions): Entity55534Entity[] {
        return this.dao.list(options);
    }

    public findById(id: number): Entity55534Entity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: Entity55534CreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "emo_ENTITY55534",
            entity: entity,
            key: {
                name: "Id",
                column: "ENTITY55534_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: Entity55534UpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "emo_ENTITY55534",
            entity: entity,
            key: {
                name: "Id",
                column: "ENTITY55534_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: Entity55534CreateEntity | Entity55534UpdateEntity): number {
        const id = (entity as Entity55534UpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as Entity55534UpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "emo_ENTITY55534",
            entity: entity,
            key: {
                name: "Id",
                column: "ENTITY55534_ID",
                value: id
            }
        });
    }

    public count(options?: Entity55534EntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "emo_ENTITY55534"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: Entity55534EntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("emo-test-entities-Entity55534", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("emo-test/entities/Entity55534").send(JSON.stringify(data));
    }
}