import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/db';
import { User } from '.';

// Define Customer attributes interface
interface CustomerAttributes {
    id?: number;
    shippingAddress?: string;
    billingAddress?: string;
    userId?: number;
    firstName?: string; // Virtual
    lastName?: string; // Virtual
    username?: string; // Virtual
    email?: string; // Virtual
    password?: string; // Virtual
}

// Define Customer creation attributes
interface CustomerCreationAttributes
    extends Optional<CustomerAttributes, 'id' | 'userId'> {}

// Define Customer model that extends Sequelize's Model class
export class Customer
    extends Model<CustomerAttributes, CustomerCreationAttributes>
    implements CustomerAttributes
{
    public id!: number;
    public shippingAddress?: string;
    public billingAddress?: string;
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

// Define Customer model schema
Customer.init(
    {
        shippingAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        billingAddress: {
            type: DataTypes.STRING,
            allowNull: true,
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
        tableName: 'customers',
    }
);

// Define associations and hooks

// Inherit from User model
Customer.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
});

// Hook to create User model before Customer is created
Customer.addHook('beforeCreate', async (customer: Customer) => {
    const { firstName, lastName, username, email, password } = customer;

    if (!firstName || !lastName || !email || !username || !password) {
        throw new Error('Missing required fields for User');
    }

    // Create a new User instance before Customer is created
    const user = await User.create({
        firstName,
        lastName,
        username,
        email,
        password,
    });

    customer.userId = user.id; // Set the foreign key after the user is created
});
