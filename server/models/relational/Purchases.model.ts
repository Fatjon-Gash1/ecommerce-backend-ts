import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/db';

interface PurchaseAttributes {
    id: number;
    customerId?: number;
    productId?: number;

    // Reports related
    categoryId?: number;
    categoryName?: string;
    purchaseCount?: number;
    totalRevenue?: number;
}

export class Purchase
    extends Model<PurchaseAttributes>
    implements PurchaseAttributes
{
    declare id: number;
    declare customerId?: number;
    declare productId?: number;

    // Reports related
    declare categoryId?: number;
    declare categoryName?: string;
    declare purchaseCount?: number;
    declare totalRevenue?: number;
}

Purchase.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'purchases',
        timestamps: false,
    }
);
