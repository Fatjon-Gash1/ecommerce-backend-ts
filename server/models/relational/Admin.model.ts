import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/db';
import { User } from './User.model';

interface AdminAttributes {
    id?: number;
    userId?: number;
    role?: 'super_admin' | 'manager';
    firstName: string; // Virtual
    lastName: string; // Virtual
    username: string; // Virtual
    email: string; // Virtual
    password: string; // Virtual
}

export class Admin extends Model<AdminAttributes> implements AdminAttributes {
    declare id?: number;
    declare userId?: number;
    declare role?: 'super_admin' | 'manager';
    declare firstName: string; // Virtual field
    declare lastName: string; // Virtual field
    declare username: string; // Virtual field
    declare email: string; // Virtual field
    declare password: string; // Virtual field;

    public async setRole(nr: number): Promise<void> {
        if (nr === 1) {
            this.role = 'super_admin';
        } else if (nr === 2) {
            this.role = 'manager';
        } else throw new Error('Invalid role number');

        await this.save();
    }
}

Admin.init(
    {
        role: {
            type: DataTypes.ENUM('super_admin', 'manager'),
            allowNull: false,
            defaultValue: 'super_admin',
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
