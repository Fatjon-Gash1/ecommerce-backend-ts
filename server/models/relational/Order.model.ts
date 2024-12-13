import {
    DataTypes,
    BelongsToManyGetAssociationsMixin,
    Model,
    Transaction,
} from 'sequelize';
import { sequelize } from '../../config/db';
import { Product } from './Product.model';
import { ProductNotFoundError } from '../../errors';

interface OrderAttributes {
    id?: number;
    customerId?: number;
    paymentMethod: 'card' | 'wallet' | 'bank-transfer';
    shippingCountry: string;
    shippingWeight: 'light' | 'standard' | 'heavy';
    shippingMethod: 'standard' | 'express' | 'next-day';
    status?: 'pending' | 'delivered' | 'canceled';
    trackingNumber?: string;
    createdAt?: Date;
}

interface OrderItemAttributes {
    id?: number;
    orderId?: number;
    productId?: number;
    quantity: number;
}

export class Order extends Model<OrderAttributes> implements OrderAttributes {
    declare id?: number;
    declare customerId?: number;
    declare paymentMethod: 'card' | 'wallet' | 'bank-transfer';
    declare shippingCountry: string;
    declare shippingWeight: 'light' | 'standard' | 'heavy';
    declare shippingMethod: 'standard' | 'express' | 'next-day';
    declare status?: 'pending' | 'delivered' | 'canceled';
    declare trackingNumber?: string;
    declare createdAt?: Date;
    declare getProducts: BelongsToManyGetAssociationsMixin<Product>;

    public static generateTrackingNumber(): string {
        const timestamp = Date.now().toString(36);
        const seed = Math.random().toString(36).substring(2, 10).toUpperCase();
        return `TN-${timestamp}-${seed}`;
    }

    public async addItem(
        productId: number,
        quantity: number,
        transaction: Transaction | null = null
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
            productPriceMap[product.id!] = product.price;
        });

        const totalPrice = orderItems.reduce((acc, item) => {
            const price = productPriceMap[item.productId!] || 0;
            return acc + price * item.quantity;
        }, 0);

        return totalPrice ? Math.ceil(totalPrice) - 0.01 : 0;
    }
}

Order.init(
    {
        paymentMethod: {
            type: DataTypes.ENUM('card', 'wallet', 'bank-transfer'),
            allowNull: false,
        },
        shippingCountry: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shippingWeight: {
            type: DataTypes.ENUM('light', 'standard', 'heavy'),
            allowNull: false,
        },
        shippingMethod: {
            type: DataTypes.ENUM('standard', 'express', 'next-day'),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'delivered', 'canceled'),
            defaultValue: 'pending',
        },
        trackingNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: () => Order.generateTrackingNumber(),
        },
    },
    { sequelize, modelName: 'Order', tableName: 'orders' }
);

export class OrderItem
    extends Model<OrderItemAttributes>
    implements OrderItemAttributes
{
    declare id?: number;
    declare orderId?: number;
    declare productId?: number;
    declare quantity: number;
}

OrderItem.init(
    {
        quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    { sequelize, modelName: 'OrderItem', tableName: 'order_items' }
);
