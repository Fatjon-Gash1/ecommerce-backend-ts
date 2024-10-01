import { DataTypes, Model, Op } from 'sequelize';
import { sequelize } from '../../config/db';
import { Product } from './Product.model';

interface OrderAttributes {
    id?: number;
    customerId?: number;
    paymentMethod: string;
    status?: 'pending' | 'delivered' | 'cancelled';
    trackingNumber?: number;
}

interface OrderItemAttributes {
    id?: number;
    orderId?: number;
    productId?: number;
    quantity: number;
}

function generateTrackingNumber(): string {
    const timestamp = Date.now().toString(36);
    const seed = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `TN-${timestamp}-${seed}`;
}

export class Order extends Model<OrderAttributes> implements OrderAttributes {
    declare id?: number;
    declare customerId?: number;
    declare paymentMethod: string;
    declare status?: 'pending' | 'delivered' | 'cancelled';
    declare trackingNumber?: number;

    public async addItem(
        productId: number,
        quantity: number = 1
    ): Promise<OrderItem> {
        const [item, created] = await OrderItem.findOrCreate({
            where: { productId },
            defaults: {
                orderId: this.id,
                productId,
                quantity,
            },
        }); // Check if productId in table is unique
        if (!created) {
            item.quantity += quantity;
            await item.save();
        }
        return item;
    }

    public async getItems(): Promise<OrderItem[]> {
        return OrderItem.findAll({ where: { orderId: this.id } });
    }

    public async getTotalPrice(): Promise<number> {
        const orderItems: Array<OrderItem> = await this.getItems();

        const productIds: Array<number> = orderItems
            .map((item) => item.productId)
            .filter((id): id is number => id !== undefined);

        const products = await Product.findAll({
            where: { id: { [Op.in]: productIds } },
        });

        const productPriceMap: Record<number, number> = {};
        products.forEach((product) => {
            productPriceMap[product.id!] = product.price;
        });

        const totalPrice = orderItems.reduce((acc, item) => {
            const price = productPriceMap[item.productId!] || 0;
            return acc + price * item.quantity;
        }, 0);

        return totalPrice;
    }
}

Order.init(
    {
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'delivered', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending',
        },
        trackingNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: generateTrackingNumber,
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
    { quantity: { type: DataTypes.INTEGER, defaultValue: 0 } },
    { sequelize, modelName: 'OrderItem', tableName: 'order_items' }
);
