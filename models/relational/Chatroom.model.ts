import { DataTypes, Model } from 'sequelize';
import type {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '@/config/db';
import { User } from './User.model';

export class Chatroom extends Model<
    InferAttributes<Chatroom>,
    InferCreationAttributes<Chatroom>
> {
    declare id: CreationOptional<number>;
    declare type: CreationOptional<'regular' | 'support'>;
}

Chatroom.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        type: {
            type: DataTypes.ENUM('regular', 'support'),
            defaultValue: 'regular',
        },
    },
    { sequelize, modelName: 'Chatroom', tableName: 'chatrooms' }
);

export class Message extends Model<
    InferAttributes<Message>,
    InferCreationAttributes<Message>
> {
    declare id: CreationOptional<number>;
    declare chatroomId: ForeignKey<Chatroom['id']>;
    declare senderId: ForeignKey<User['id']>;
    declare message: string;
    declare systemMessage: boolean;
}

Message.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        message: { type: DataTypes.STRING, allowNull: false },
        systemMessage: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { sequelize, modelName: 'Message', tableName: 'messages' }
);
