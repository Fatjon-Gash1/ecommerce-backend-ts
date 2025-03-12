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
import { Order } from './Order.model';

export class RefundRequest extends Model<
    InferAttributes<RefundRequest>,
    InferCreationAttributes<RefundRequest>
> {
    declare id: CreationOptional<number>;
    declare reason: string;
    declare amount: number | null;
    declare status: CreationOptional<'pending' | 'approved' | 'denied'>;
    declare customerId: ForeignKey<Customer['id']>;
    declare orderId: ForeignKey<Order['id']>;
    declare customer?: NonAttribute<Customer>;
    declare order?: NonAttribute<Order>;
}

RefundRequest.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        reason: { type: DataTypes.STRING, allowNull: false },
        amount: { type: DataTypes.INTEGER },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'denied'),
            defaultValue: 'pending',
        },
    },
    { sequelize, tableName: 'refund_requests' }
);
