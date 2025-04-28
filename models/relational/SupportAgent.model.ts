import { DataTypes, Model } from 'sequelize';
import type {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '@/config/db';
import { User } from './User.model';

export class SupportAgent extends Model<
    InferAttributes<SupportAgent>,
    InferCreationAttributes<SupportAgent>
> {
    declare id: CreationOptional<number>;
    declare userId: ForeignKey<User['id']>;
    declare status: 'available' | 'busy';
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
    declare averageResponseTime?: number;
    declare averageCustomerRating?: number;
    declare handledTickets?: number;
    declare resolvedTickets?: number;
}

SupportAgent.init(
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
            type: DataTypes.ENUM('available', 'busy'),
            defaultValue: 'available',
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
        modelName: 'SupportAgent',
        tableName: 'customers',
    }
);

SupportAgent.beforeCreate(async (customer: SupportAgent) => {
    const { firstName, lastName, username, email, password, isActive, lastLogin } =
        customer;

    const user = await User.create({
        firstName,
        lastName,
        username,
        email,
        password,
        isActive,
        lastLogin
    });

    customer.userId = user.id;
});
