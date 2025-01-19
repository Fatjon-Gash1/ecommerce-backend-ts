import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/db';

interface SubscriptionAttributes {
    id?: number;
    customerId?: number;
    orderId?: number;
    startDate: string;
    lastPaymentDate?: string;
    nextPaymentDate?: string;
    endDate?: string;
    times?: number;
}

interface SubscriptionPaymentAttributes {
    id?: number;
    subscriptionId?: number;
    paymentDate: string;
}

export class Subscription
    extends Model<SubscriptionAttributes>
    implements SubscriptionAttributes
{
    declare id?: number;
    declare customerId?: number;
    declare orderId?: number;
    declare startDate: string;
    declare lastPaymentDate?: string;
    declare nextPaymentDate?: string;
    declare endDate?: string;
    declare times?: number;
}

Subscription.init(
    {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            autoIncrement: true,
            primaryKey: true,
        },
        startDate: { type: DataTypes.DATE, allowNull: false },
        lastPaymentDate: { type: DataTypes.DATE },
        nextPaymentDate: { type: DataTypes.DATE },
        endDate: { type: DataTypes.DATE },
        times: { type: DataTypes.INTEGER },
    },
    {
        sequelize,
        tableName: 'subscriptions',
        paranoid: true,
    }
);

export class SubscriptionPayment
    extends Model<SubscriptionPaymentAttributes>
    implements SubscriptionPaymentAttributes
{
    declare id?: number;
    declare subscriptionId?: number;
    declare paymentDate: string;
}

SubscriptionPayment.init(
    {
        paymentDate: { type: DataTypes.DATE, allowNull: false },
    },
    {
        sequelize,
        tableName: 'subscription_payments',
        timestamps: false,
    }
);

Subscription.beforeUpdate(async ({ lastPaymentDate, id }, options) => {
    await SubscriptionPayment.create(
        {
            paymentDate: lastPaymentDate!,
            subscriptionId: id,
        },
        { transaction: options.transaction }
    );
});
