import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/db';

interface PaymentAttributes {
    id?: number;
    customerId?: number;
    stripeId: string;
    amount: number;
    currency: 'usd' | 'eur';
    description: string;
}

export class Payment
    extends Model<PaymentAttributes>
    implements PaymentAttributes
{
    declare id?: number;
    declare customerId?: number;
    declare stripeId: string;
    declare amount: number;
    declare currency: 'usd' | 'eur';
    declare description: string;
} // This model seems obsolete

Payment.init(
    {
        stripeId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        currency: {
            type: DataTypes.ENUM('usd', 'eur'),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    { sequelize, modelName: 'Payment', tableName: 'payments' }
);
