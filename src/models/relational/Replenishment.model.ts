import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../../config/db';
const sequelize = getSequelize();

interface ReplenishmentAttributes {
    id?: number;
    schedulerId: string;
    nextJobId?: string | null;
    customerId?: number;
    orderId?: number;
    startDate: string;
    lastPaymentDate?: string | null;
    nextPaymentDate?: string | null;
    unit: Unit;
    interval: number;
    endDate?: string;
    times?: number;
    executions?: number;
    status?: Status;
}

interface ReplenishmentPaymentAttributes {
    id?: number;
    replenishmentId?: number;
    paymentDate: string;
}

type Unit = 'day' | 'week' | 'month' | 'year' | 'custom';
type Status = 'scheduled' | 'active' | 'finished' | 'canceled' | 'failed';

export class Replenishment
    extends Model<ReplenishmentAttributes>
    implements ReplenishmentAttributes
{
    declare id?: number;
    declare schedulerId: string;
    declare nextJobId?: string | null;
    declare customerId?: number;
    declare orderId?: number;
    declare startDate: string;
    declare lastPaymentDate?: string | null;
    declare nextPaymentDate?: string | null;
    declare unit: Unit;
    declare interval: number;
    declare endDate?: string;
    declare times?: number;
    declare executions?: number;
    declare status?:
        | 'scheduled'
        | 'active'
        | 'finished'
        | 'canceled'
        | 'failed';
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
        nextJobId: { type: DataTypes.STRING },
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
        executions: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM(
                'scheduled',
                'active',
                'finished',
                'canceled',
                'failed'
            ),
            allowNull: false,
            defaultValue: 'active',
        },
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
    if (lastPaymentDate) {
        await ReplenishmentPayment.create(
            {
                paymentDate: lastPaymentDate,
                replenishmentId: id,
            },
            { transaction: options.transaction }
        );
    }
});
