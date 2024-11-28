import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/db';
import { User } from './User.model';

interface AdminAttributes {
    id?: number;
    userId?: number;
    role?: 'admin' | 'manager';
    firstName: string; // Virtual
    lastName: string; // Virtual
    username: string; // Virtual
    email: string; // Virtual
    password: string; // Virtual
    user?: User;
}

export class Admin extends Model<AdminAttributes> implements AdminAttributes {
    declare id?: number;
    declare userId?: number;
    declare role?: 'admin' | 'manager';
    declare firstName: string; // Virtual field
    declare lastName: string; // Virtual field
    declare username: string; // Virtual field
    declare email: string; // Virtual field
    declare password: string; // Virtual field;
    declare user?: User;
}

Admin.init(
    {
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
