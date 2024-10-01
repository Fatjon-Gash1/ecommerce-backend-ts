import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/db';

interface ShippingWeightAttributes {
    id?: number;
    weightRange: 'light' | 'standard' | 'heavy';
    rate: number;
}

interface ShippingMethodAttributes {
    id?: number;
    shippingMethod: 'standard' | 'express' | 'next-day';
    rate: number;
}

export class ShippingWeight
    extends Model<ShippingWeightAttributes>
    implements ShippingWeightAttributes
{
    declare id?: number;
    declare weightRange: 'light' | 'standard' | 'heavy';
    declare rate: number;
}

ShippingWeight.init(
    {
        weightRange: {
            type: DataTypes.ENUM('light', 'standard', 'heavy'),
            allowNull: false,
            unique: true,
        },
        rate: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'shipping_weights',
        timestamps: false,
    }
);

export class ShippingMethod
    extends Model<ShippingMethodAttributes>
    implements ShippingMethodAttributes
{
    declare id?: number;
    declare shippingMethod: 'standard' | 'express' | 'next-day';
    declare rate: number;
}

ShippingMethod.init(
    {
        shippingMethod: {
            type: DataTypes.ENUM('standard', 'express', 'next-day'),
            defaultValue: 'standard',
            allowNull: false,
            unique: true,
        },
        rate: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    { sequelize, tableName: 'shipping_methods', timestamps: false }
);
