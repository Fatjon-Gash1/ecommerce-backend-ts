import {
    DataTypes,
    BelongsToManyGetAssociationsMixin,
    Model,
    BelongsToManyCountAssociationsMixin,
    BelongsToManyRemoveAssociationsMixin,
} from 'sequelize';
import { Product } from './Product.model';
import { Customer } from './Customer.model';
import { getSequelize } from '../../config/db';
const sequelize = getSequelize();

interface CartAttributes {
    id?: number;
    customerId?: number;
    active?: boolean;
}

interface CartItemAttributes {
    cartId?: number;
    productId?: number;
    quantity: number;
}

export class Cart extends Model<CartAttributes> implements CartAttributes {
    declare id?: number;
    declare customerId?: number;
    declare active: boolean;
    declare getProducts: BelongsToManyGetAssociationsMixin<Product>;
    declare countProducts: BelongsToManyCountAssociationsMixin;
    declare removeProducts: BelongsToManyRemoveAssociationsMixin<
        Product,
        number
    >;

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
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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
