import { DataTypes, Model } from 'sequelize';
import type {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    NonAttribute,
} from 'sequelize';
import { sequelize } from '@/config/db';
import { User } from './User.model';

export class Chatroom extends Model<
    InferAttributes<Chatroom>,
    InferCreationAttributes<Chatroom>
> {
    declare id: CreationOptional<number>;
    declare type: CreationOptional<'one-on-one' | 'group' | 'support'>;
    declare groupAdmin: CreationOptional<ForeignKey<User['id']>>;
    declare name: CreationOptional<string>;

    // Association properties
    declare messages: NonAttribute<Message[]>;
}

Chatroom.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        type: {
            type: DataTypes.ENUM('one-on-one', 'group', 'support'),
            defaultValue: 'regular',
        },
        name: { type: DataTypes.STRING },
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
    declare systemMessage: CreationOptional<boolean>;
    declare status: CreationOptional<'original' | 'edited' | 'removed'>;
}

Message.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        message: { type: DataTypes.STRING, allowNull: false },
        systemMessage: { type: DataTypes.BOOLEAN, defaultValue: false },
        status: {
            type: DataTypes.ENUM('original', 'edited', 'removed'),
            defaultValue: 'original',
        },
    },
    { sequelize, modelName: 'Message', tableName: 'messages' }
);

export class UserChatroom extends Model<
    InferAttributes<UserChatroom>,
    InferCreationAttributes<UserChatroom>
> {
    declare id: CreationOptional<number>;
    declare userId: ForeignKey<User['id']>;
    declare chatroomId: ForeignKey<Chatroom['id']>;
}

UserChatroom.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    },
    { sequelize, modelName: 'UserChatroom', tableName: 'user_chatrooms' }
);
