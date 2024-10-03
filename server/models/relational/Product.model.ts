import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/db';
import { Category } from './Category.model';
import client from '../../config/elasticsearchClient';
import { NotificationService } from '../../services';
const notificationService = new NotificationService();

interface ProductAttributes {
    id?: number;
    categoryId?: number;
    name: string;
    description: string;
    price: number;
    discount?: number;
    imageUrl: string;
    stockQuantity?: number;
    weight: number;
    views?: number;
    purchaseCount?: number;
    Category?: Category;
    total?: number;
}

export class Product
    extends Model<ProductAttributes>
    implements ProductAttributes
{
    declare id?: number;
    declare categoryId?: number;
    declare name: string;
    declare description: string;
    declare price: number;
    declare discount?: number;
    declare imageUrl: string;
    declare stockQuantity?: number;
    declare weight: number;
    declare views?: number;
    declare purchaseCount?: number;
    declare Category?: Category;
    declare total?: number;

    public getPriceWithDiscount(): number {
        return this.price - (this.price * this.discount!) / 100;
    }

    public async getCategory(): Promise<Category | null> {
        return await Category.findByPk(this.categoryId);
    }
}

Product.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        discount: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        stockQuantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
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
    }
);

// Product addition threshold for sending product promotions email
let productsForPromotion: number = 0; // Will be converted to an array of Products in the future
const promotionThreshold: number = 10;

Product.afterCreate(async () => {
    productsForPromotion++;

    if (productsForPromotion === promotionThreshold) {
        await notificationService.sendNewPromotionsEmail();
        productsForPromotion = 0;
    }
});

const bulkOperations: object[] = [];
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
        await client.bulk({ body: bulkOperations });
        bulkOperations.length = 0;
    }
});
