import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/db';

interface ReplenishmentAttributes {
    id?: number;
    schedulerId: string;
    customerId?: number;
    orderId?: number;
    startDate: string;
    lastPaymentDate?: string;
    nextPaymentDate?: string;
    unit: Unit;
    interval: number;
    endDate?: string | null;
    times?: number | null;
}

interface ReplenishmentPaymentAttributes {
    id?: number;
    replenishmentId?: number;
    paymentDate: string;
}

type Unit = 'day' | 'week' | 'month' | 'year' | 'custom';

export class Replenishment
    extends Model<ReplenishmentAttributes>
    implements ReplenishmentAttributes
{
    declare id?: number;
    declare schedulerId: string;
    declare customerId?: number;
    declare orderId?: number;
    declare startDate: string;
    declare lastPaymentDate?: string;
    declare nextPaymentDate?: string;
    declare unit: Unit;
    declare interval: number;
    declare endDate?: string | null;
    declare times?: number | null;
}

Replenishment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            autoIncrement: true,
            primaryKey: true,
        },
        schedulerId: { type: DataTypes.STRING, allowNull: false },
        startDate: { type: DataTypes.DATE, allowNull: false },
        lastPaymentDate: { type: DataTypes.DATE },
        nextPaymentDate: { type: DataTypes.DATE },
        unit: {
            type: DataTypes.ENUM('day', 'week', 'month', 'year', 'custom'),
            allowNull: false,
        },
        interval: { type: DataTypes.INTEGER, allowNull: false },
        endDate: { type: DataTypes.DATE },
        times: { type: DataTypes.INTEGER },
    },
    {
        sequelize,
        tableName: 'replenishments',
        paranoid: true,
    }
);

export class ReplenishmentPayment
    extends Model<ReplenishmentPaymentAttributes>
    implements ReplenishmentPaymentAttributes
{
    declare id?: number;
    declare replenishmentId?: number;
    declare paymentDate: string;
}

ReplenishmentPayment.init(
    {
        paymentDate: { type: DataTypes.DATE, allowNull: false },
    },
    {
        sequelize,
        tableName: 'replenishment_payments',
        timestamps: false,
    }
);

Replenishment.beforeUpdate(async ({ lastPaymentDate, id }, options) => {
    await ReplenishmentPayment.create(
        {
            paymentDate: lastPaymentDate!,
            replenishmentId: id,
        },
        { transaction: options.transaction }
    );
});
