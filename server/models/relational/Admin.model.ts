import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/db';
import { User } from '.';

// Define Admin attributes interface
interface AdminAttributes {
    id?: number;
    role: 'super_admin' | 'manager';
    userId?: number;
    firstName?: string; // Virtual
    lastName?: string; // Virtual
    username?: string; // Virtual
    email?: string; // Virtual
    password?: string; // Virtual
}

// Define Admin creation attributes interface
interface AdminCreationAttributes
    extends Optional<AdminAttributes, 'id' | 'userId'> {}

// Define Admin model that extends Sequelize's Model class
export class Admin
    extends Model<AdminAttributes, AdminCreationAttributes>
    implements AdminAttributes
{
    public id!: number;
    public role!: 'super_admin' | 'manager';
    public userId!: number;
    public firstName?: string; // Virtual field
    public lastName?: string; // Virtual field
    public username?: string; // Virtual field
    public email?: string; // Virtual field
    public password?: string; // Virtual field;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Define Admin model schema
Admin.init(
    {
        role: {
            type: DataTypes.ENUM('super_admin', 'manager'),
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
    },
    {
        sequelize,
        timestamps: true,
        tableName: 'admins',
    }
);

// Define associations and hooks

// Inherit from User model
Admin.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
});

// Hook to create User model before Admin is created
Admin.addHook('beforeCreate', async (admin: Admin) => {
    const { firstName, lastName, username, email, password } = admin;

    if (!firstName || !lastName || !email || !username || !password) {
        throw new Error('Missing required fields for User');
    }

    // Create a new User instance before Admin is created
    const user = await User.create({
        firstName,
        lastName,
        username,
        email,
        password,
    });

    admin.userId = user.id; // Set the foreign key after the user is created
});
