import { DataTypes, Model } from 'sequelize';
import type {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '@/config/db';
import { Product } from './Product.model';
import { Order } from './Order.model';

export class Purchase extends Model<
    InferAttributes<Purchase>,
    InferCreationAttributes<Purchase>
> {
    declare id: CreationOptional<number>;
    declare orderId: ForeignKey<Order['id']>;
    declare productId: ForeignKey<Product['id']>;
    declare purchasePrice: number;

    // Response fields
    declare Product?: Product;
    declare purchaseCount?: number;
    declare totalRevenue?: number;
    declare categoryId?: number;
    declare categoryName?: string;
    declare categoryPurchaseCount?: number;
    declare categoryTotalRevenue?: number;
    declare purchasedProductId?: number;
    declare productName?: string;
    declare productCurrentPrice?: number;
    declare productPurchaseCount?: number;
    declare totalSpentOnProduct?: number;
}

Purchase.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        purchasePrice: { type: DataTypes.FLOAT, allowNull: false },
    },
    {
        sequelize,
        tableName: 'purchases',
    }
);
