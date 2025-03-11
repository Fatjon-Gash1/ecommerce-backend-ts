import { DataTypes, Model } from 'sequelize';
import type {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '@/config/db';
import { User } from './User.model';

export class Admin extends Model<
    InferAttributes<Admin>,
    InferCreationAttributes<Admin>
> {
    declare id: CreationOptional<number>;
    declare userId: ForeignKey<User['id']>;
    declare role: CreationOptional<'admin' | 'manager'>;
    declare firstName: string; // Virtual field
    declare lastName: string; // Virtual field
    declare username: string; // Virtual field
    declare email: string; // Virtual field
    declare password: string; // Virtual field
    declare user?: User;
}

Admin.init(
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
        role: {
            type: DataTypes.ENUM('admin', 'manager'),
            allowNull: false,
            defaultValue: 'manager',
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
    },
    {
        sequelize,
        modelName: 'Admin',
        tableName: 'admins',
    }
);

Admin.beforeCreate(async (admin: Admin) => {
    const { firstName, lastName, username, email, password } = admin;

    const user = await User.create({
        firstName,
        lastName,
        username,
        email,
        password,
    });

    admin.userId = user.id;
});
