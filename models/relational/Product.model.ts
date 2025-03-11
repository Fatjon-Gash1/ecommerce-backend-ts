import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/config/db';
import { Category } from './Category.model';
import client from '@/config/elasticsearch';

interface ICartItem {
    quantity: number;
}

interface ProductAttributes {
    id?: number;
    categoryId?: number;
    name: string;
    description: string;
    currency: string;
    price: number;
    discount?: number;
    imageUrl: string;
    stockQuantity?: number;
    weight: number;
    views?: number;
    purchaseCount?: number;
    Category?: Category;
    total?: number;
    deletedAt?: Date | undefined;
    CartItem?: ICartItem;
    quantity?: number;
    OrderItem?: Product;
}

export class Product
    extends Model<ProductAttributes>
    implements ProductAttributes
{
    declare id?: number;
    declare categoryId?: number;
    declare name: string;
    declare description: string;
    declare currency: string;
    declare price: number;
    declare discount?: number;
    declare imageUrl: string;
    declare stockQuantity?: number;
    declare weight: number;
    declare views?: number;
    declare purchaseCount?: number;
    declare Category?: Category;
    declare total?: number;
    declare deletedAt?: Date | undefined;
    declare CartItem?: ICartItem;
    declare quantity?: number;
    declare OrderItem?: Product;
}

Product.init(
    {
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
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
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
