import { DataTypes, Model } from 'sequelize';
import type {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Transaction,
    BelongsToManyGetAssociationsMixin,
    NonAttribute,
} from 'sequelize';
import { sequelize } from '@/config/db';
import { Customer } from './Customer.model';
import { Product } from './Product.model';
import { RefundRequest } from './RefundRequest.model';
import { ProductNotFoundError } from '@/errors';
import { Courier } from './Courier.model';

export class Order extends Model<
    InferAttributes<Order>,
    InferCreationAttributes<Order>
> {
    declare id: CreationOptional<number>;
    declare customerId: ForeignKey<Customer['id']>;
    declare courierId: CreationOptional<ForeignKey<Courier['id']>>;
    declare paymentMethod: 'card' | 'wallet' | 'bank-transfer';
    declare shippingCountry: string;
    declare weightCategory:
        | 'light'
        | 'standard'
        | 'heavy'
        | 'very-heavy'
        | 'extra-heavy';
    declare orderWeight: number;
    declare shippingMethod: 'standard' | 'express' | 'next-day';
    declare status: CreationOptional<
        | 'pending'
        | 'shipped'
        | 'awaiting pickup'
        | 'delivered'
        | 'refunded'
        | 'partially-refunded'
        | 'uncollected'
    >;
    declare trackingNumber: CreationOptional<string>;
    declare total: number;
    declare paymentIntentId: string;
    declare getProducts: BelongsToManyGetAssociationsMixin<Product>;
    declare refundRequest?: NonAttribute<RefundRequest>;
    declare rating: CreationOptional<number>;
    declare proofOfDeliveryImageUrl: CreationOptional<string>;
    declare safeShipping: CreationOptional<boolean>;

    // Aggregation properties
    declare averageRating: NonAttribute<number>;
    declare shippedOrders: NonAttribute<number>;
    declare deliveredOrders: NonAttribute<number>;

    public static generateTrackingNumber(): string {
        const timestamp = Date.now().toString(36);
        const seed = Math.random().toString(36).substring(2, 10).toUpperCase();
        return `TN-${timestamp}-${seed}`;
    }

    public async addItem(
        productId: number,
        quantity: number,
        transaction: Transaction
    ): Promise<OrderItem> {
        const foundProduct = await Product.findByPk(productId, { transaction });

        if (!foundProduct) {
            throw new ProductNotFoundError();
        }

        const [item, created] = await OrderItem.findOrCreate({
            where: { productId, orderId: this.id },
            defaults: {
                orderId: this.id,
                productId,
                quantity,
            },
            transaction,
        });
        if (!created) {
            item.quantity += quantity;
            await item.save({ transaction });
        }
        return item;
    }

    public async getItems(): Promise<OrderItem[]> {
        return await OrderItem.findAll({ where: { orderId: this.id } });
    }

    public async getTotalPrice(): Promise<number> {
        const orderItems: Array<OrderItem> = await this.getItems();

        const products = await this.getProducts();

        const productPriceMap: Record<number, number> = {};
        products.forEach((product) => {
            productPriceMap[product.id] = product.price;
        });

        const totalPrice = orderItems.reduce((acc, item) => {
            const price = productPriceMap[item.productId] || 0;
            return acc + price * item.quantity;
        }, 0);

        return totalPrice ? Math.ceil(totalPrice) - 0.01 : 0;
    }
}

Order.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        paymentMethod: {
            type: DataTypes.ENUM('card', 'wallet', 'bank-transfer'),
            allowNull: false,
        },
        shippingCountry: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        weightCategory: {
            type: DataTypes.ENUM(
                'light',
                'standard',
                'heavy',
                'very-heavy',
                'extra-heavy'
            ),
            allowNull: false,
        },
        orderWeight: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        shippingMethod: {
            type: DataTypes.ENUM('standard', 'express', 'next-day'),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(
                'pending',
                'shipped',
                'awaiting pickup',
                'delivered',
                'refunded',
                'partially-refunded',
                'uncollected'
            ),
            defaultValue: 'pending',
        },
        trackingNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: () => Order.generateTrackingNumber(),
        },
        total: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        paymentIntentId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rating: {
            type: DataTypes.TINYINT.UNSIGNED,
            validate: { min: 1, max: 5 },
        },
        proofOfDeliveryImageUrl: { type: DataTypes.STRING },
        safeShipping: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { sequelize, modelName: 'Order', tableName: 'orders' }
);

export class OrderItem extends Model<
    InferAttributes<OrderItem>,
    InferCreationAttributes<OrderItem>
> {
    declare id: CreationOptional<number>;
    declare orderId: ForeignKey<Order['id']>;
    declare productId: ForeignKey<Product['id']>;
    declare quantity: CreationOptional<number>;
}

OrderItem.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    { sequelize, modelName: 'OrderItem', tableName: 'order_items' }
);
