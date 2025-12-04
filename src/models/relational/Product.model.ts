import { DataTypes, Model } from 'sequelize';
import type {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
} from 'sequelize';
import { getSequelize } from '../../config/db';
import { Category } from './Category.model';
//import client from '@/config/elasticsearch';
const sequelize = getSequelize();

export class Product extends Model<
    InferAttributes<Product>,
    InferCreationAttributes<Product>
> {
    declare id: CreationOptional<number>;
    declare categoryId: ForeignKey<Category['id']>;
    declare productNumber: CreationOptional<string>;
    declare parentId: ForeignKey<Product['id']>;
    declare name: string;
    declare description: string;
    declare currency: string;
    declare price: number;
    declare discount: CreationOptional<number>;
    declare availableDue: CreationOptional<Date | null>;
    declare imageUrls: string[];
    declare stockQuantity: CreationOptional<number>;
    declare weight: number;
    declare views: CreationOptional<number>;
    declare addToCartRate: CreationOptional<number>;

    // Association properties
    declare CartItem?: { quantity: number };
    declare OrderItem?: { quantity: number };
    declare Category?: Category;

    public static generateProductNumber() {
        const timestamp = Date.now().toString(36);
        const seed = Math.random().toString(36);
        return `S${timestamp.substring(timestamp.length / 2)}${seed.substring(seed.length / 2)}`.toUpperCase();
    }
}

Product.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        productNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: () => Product.generateProductNumber(),
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            defaultValue: 'eur',
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        discount: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
        availableDue: {
            type: DataTypes.DATE,
        },
        imageUrls: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },
        stockQuantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        weight: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        addToCartRate: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
        paranoid: true,
    }
);

/*const bulkOperations: object[] = [];
const limit = 5;

Product.afterCreate(async (product) => {
    bulkOperations.push({
        index: { _index: 'products', _id: product.id!.toString() },
    });
    bulkOperations.push({
        name: product.name,
        description: product.description,
        price: product.price,
    });

    // Perform bulk operation per given chunk
    if (bulkOperations.length >= limit) {
        try {
            await client.bulk({ body: bulkOperations });
            bulkOperations.length = 0;
        } catch (err) {
            console.error(
                'Elasticsearch bulk operation error on index (create):',
                err
            );
        }
    }
});

Product.afterUpdate(async (product) => {
    bulkOperations.push({
        update: { _index: 'products', _id: product.id!.toString() },
    });
    bulkOperations.push({
        doc: {
            name: product.name,
            description: product.description,
            price: product.price,
        },
    });

    // Perform bulk operation per given chunk
    if (bulkOperations.length >= limit) {
        try {
            await client.bulk({ body: bulkOperations });
            bulkOperations.length = 0;
        } catch (err) {
            console.error('Elasticsearch bulk operation error on update:', err);
        }
    }
});

Product.afterDestroy(async (product) => {
    bulkOperations.push({
        delete: { _index: 'products', _id: product.id!.toString() },
    });

    // Execute bulk request after specific operations
    if (bulkOperations.length >= limit) {
        try {
            await client.bulk({ body: bulkOperations });
            bulkOperations.length = 0;
        } catch (err) {
            console.error('Elasticsearch bulk operation error on delete:', err);
        }
    }
});*/
