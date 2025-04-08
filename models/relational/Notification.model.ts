import { DataTypes, Model } from 'sequelize';
import type {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '@/config/db';
import { User } from './User.model';

export class Notification extends Model<
    InferAttributes<Notification>,
    InferCreationAttributes<Notification>
> {
    declare id: CreationOptional<number>;
    declare userId: ForeignKey<User['id']>;
    declare message: string;
    declare isRead: CreationOptional<boolean>;
}

Notification.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        message: { type: DataTypes.STRING, allowNull: false },
        isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { sequelize, tableName: 'notifications' }
);
