import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/db';

interface SaleAttributes {
    id?: number;
    orderId?: number;
    total: number;
    totalRevenue?: number;
    averageOrderValue?: number;
}

export class Sale extends Model<SaleAttributes> implements SaleAttributes {
    declare id?: number;
    declare orderId?: number;
    declare total: number;
    declare totalRevenue?: number;
    declare averageOrderValue?: number;
}

Sale.init(
    { total: { type: DataTypes.FLOAT, allowNull: false } },
    { sequelize, modelName: 'Sale', tableName: 'sales' }
);
