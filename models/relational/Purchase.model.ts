import { DataTypes, Model } from 'sequelize';
import type {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    NonAttribute,
} from 'sequelize';
import { sequelize } from '@/config/db';
import { Customer } from './Customer.model';
import { Product } from './Product.model';

export class Purchase extends Model<
    InferAttributes<Purchase>,
    InferCreationAttributes<Purchase>
> {
    declare id: CreationOptional<number>;
    declare customerId: ForeignKey<Customer['id']>;
    declare productId: ForeignKey<Product['id']>;
    declare quantity: CreationOptional<number>;
    declare discountRate: CreationOptional<number>;

    // Reports related
    declare categoryId?: NonAttribute<number>;
    declare categoryName?: NonAttribute<string>;
    declare purchaseCount?: NonAttribute<number>;
    declare totalRevenue?: NonAttribute<number>;
}

Purchase.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
        discountRate: { type: DataTypes.FLOAT, defaultValue: 1 },
    },
    {
        sequelize,
        tableName: 'purchases',
    }
);
