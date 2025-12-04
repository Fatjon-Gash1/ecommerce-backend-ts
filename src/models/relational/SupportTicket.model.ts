import { DataTypes, Model } from 'sequelize';
import type {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
} from 'sequelize';
import { getSequelize } from '../../config/db';
import { Chatroom } from './Chatroom.model';
import { SupportAgent } from './SupportAgent.model';
const sequelize = getSequelize();

export class SupportTicket extends Model<
    InferAttributes<SupportTicket>,
    InferCreationAttributes<SupportTicket>
> {
    declare id: CreationOptional<number>;
    declare chatroomId: ForeignKey<Chatroom['id']>;
    declare agentId: ForeignKey<SupportAgent['id']>;
    declare initialResponseTime: number;
    declare customerRating: CreationOptional<number>;
    declare status: CreationOptional<'pending' | 'failed' | 'resolved'>;
}

SupportTicket.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        initialResponseTime: { type: DataTypes.INTEGER, allowNull: false },
        customerRating: {
            type: DataTypes.TINYINT.UNSIGNED,
            validate: { min: 1, max: 5 },
        },
        status: {
            type: DataTypes.ENUM('pending', 'failed', 'resolved'),
            defaultValue: 'pending',
        },
    },
    {
        sequelize,
        modelName: 'SupportTicket',
        tableName: 'support_tickets',
    }
);
