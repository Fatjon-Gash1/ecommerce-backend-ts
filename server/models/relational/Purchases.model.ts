import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/db';

interface PurchaseAttributes {
    id?: number;
    customerId?: number;
    productId?: number;
    quantity: number;

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
    declare id?: number;
    declare customerId?: number;
    declare productId?: number;
    declare quantity: number;

    // Reports related
    declare categoryId?: number;
    declare categoryName?: string;
    declare purchaseCount?: number;
    declare totalRevenue?: number;
}

Purchase.init(
    {
        quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    {
        sequelize,
        tableName: 'purchases',
    }
);
