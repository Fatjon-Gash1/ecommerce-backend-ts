import { DataTypes, Model, Op } from 'sequelize';
import { sequelize } from '../../config/db';
import { Product } from './Product.model';

interface CartAttributes {
    id?: number;
    customerId?: number;
}

interface CartItemAttributes {
    id?: number;
    cartId?: number;
    productId?: number;
    quantity: number;
}

export class Cart extends Model<CartAttributes> implements CartAttributes {
    declare id?: number;
    declare customerId?: number;

    public async getItems(): Promise<CartItem[]> {
        return CartItem.findAll({ where: { cartId: this.id } });
    }

    public async getTotalPrice(): Promise<number> {
        const cartItems: Array<CartItem> = await this.getItems();

        const productIds: Array<number> = cartItems
            .map((item) => item.productId)
            .filter((id): id is number => id !== undefined);

        const products = await Product.findAll({
            where: { id: { [Op.in]: productIds } },
        });

        const productPriceMap: Record<number, number> = {};
        products.forEach((product) => {
            productPriceMap[product.id!] = product.price;
        });

        const totalPrice = cartItems.reduce((acc, item) => {
            const price = productPriceMap[item.productId!] || 0;
            return acc + price * item.quantity;
        }, 0);

        return totalPrice;
    }
}

Cart.init({}, { sequelize, modelName: 'Cart', tableName: 'carts' });

export class CartItem
    extends Model<CartItemAttributes>
    implements CartItemAttributes
{
    declare id?: number;
    declare cartId?: number;
    declare productId?: number;
    declare quantity: number;
}

CartItem.init(
    { quantity: { type: DataTypes.INTEGER, defaultValue: 0 } },
    { sequelize, modelName: 'CartItem', tableName: 'cart_items' }
);
