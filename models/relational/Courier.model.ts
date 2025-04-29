import { DataTypes, Model } from 'sequelize';
import type {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '@/config/db';
import { User } from './User.model';

export class Courier extends Model<
    InferAttributes<Courier>,
    InferCreationAttributes<Courier>
> {
    declare id: CreationOptional<number>;
    declare userId: ForeignKey<User['id']>;
    declare status: 'packaging' | 'delivering' | 'returning' | 'ready';
    declare phoneNumber: string;

    // Virtual fields
    declare firstName: string;
    declare lastName: string;
    declare username: string;
    declare email: string;
    declare password: string;
    declare isActive: CreationOptional<boolean>;
    declare lastLogin: CreationOptional<Date | string>;

    // Associations
    declare user?: User;
    declare averageCustomerRating?: number;
}

Courier.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: {
            type: DataTypes.INTEGER,
            unique: true,
            references: {
                model: User,
                key: 'id',
            },
        },
        status: {
            type: DataTypes.ENUM(
                'packaging',
                'delivering',
                'returning',
                'ready'
            ),
            defaultValue: 'ready',
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Virtual fields
        firstName: {
            type: DataTypes.VIRTUAL,
        },
        lastName: {
            type: DataTypes.VIRTUAL,
        },
        username: {
            type: DataTypes.VIRTUAL,
        },
        email: {
            type: DataTypes.VIRTUAL,
        },
        password: {
            type: DataTypes.VIRTUAL,
        },
        isActive: {
            type: DataTypes.VIRTUAL,
        },
        lastLogin: {
            type: DataTypes.VIRTUAL,
        },
    },
    {
        sequelize,
        modelName: 'Courier',
        tableName: 'couriers',
    }
);

Courier.beforeCreate(async (courier: Courier) => {
    const {
        firstName,
        lastName,
        username,
        email,
        password,
        isActive,
        lastLogin,
    } = courier;

    const user = await User.create({
        firstName,
        lastName,
        username,
        email,
        password,
        isActive,
        lastLogin,
    });

    courier.userId = user.id;
});
