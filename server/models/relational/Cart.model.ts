import { DataTypes, BelongsToManyGetAssociationsMixin, Model } from 'sequelize';
import { sequelize } from '../../config/db';
import { Product } from './Product.model';
import { Customer } from './Customer.model';

interface CartAttributes {
    id?: number;
    customerId?: number;
}

interface CartItemAttributes {
    cartId?: number;
    productId?: number;
    quantity: number;
}

export class Cart extends Model<CartAttributes> implements CartAttributes {
    declare id?: number;
    declare customerId?: number;
    declare getProducts: BelongsToManyGetAssociationsMixin<Product>;

    public async getItems(): Promise<CartItem[]> {
        return await CartItem.findAll({ where: { cartId: this.id } });
    }

    public async getTotalPrice(): Promise<number> {
        const cartItems: Array<CartItem> = await this.getItems();

        const products = await this.getProducts();

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

Cart.init(
    {
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: { model: Customer, key: 'id' },
        },
    },
    { sequelize, modelName: 'Cart', tableName: 'carts' }
);

export class CartItem
    extends Model<CartItemAttributes>
    implements CartItemAttributes
{
    declare cartId?: number;
    declare productId?: number;
    declare quantity: number;
}

CartItem.init(
    { quantity: { type: DataTypes.INTEGER, defaultValue: 1 } },
    {
        sequelize,
        modelName: 'CartItem',
        tableName: 'cart_items',
        timestamps: false,
    }
);
