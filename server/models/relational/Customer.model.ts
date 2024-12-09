import { DataTypes, Model, BelongsToManyGetAssociationsMixin } from 'sequelize';
import { sequelize } from '../../config/db';
import { User } from './User.model';
import { Cart } from './Cart.model';
import { Product } from './Product.model';

interface CustomerAttributes {
    id?: number;
    userId?: number;
    stripeId?: string;
    shippingAddress?: string;
    billingAddress?: string;
    isActive?: boolean;
    firstName: string; // Virtual
    lastName: string; // Virtual
    username: string; // Virtual
    email: string; // Virtual
    password: string; // Virtual
    user?: User;
}

export class Customer
    extends Model<CustomerAttributes>
    implements CustomerAttributes
{
    declare id?: number;
    declare userId?: number;
    declare stripeId?: string;
    declare shippingAddress?: string;
    declare billingAddress?: string;
    declare isActive?: boolean;
    declare firstName: string; // Virtual field
    declare lastName: string; // Virtual field
    declare username: string; // Virtual field
    declare email: string; // Virtual field
    declare password: string; // Virtual field;
    declare user?: User;

    // For reports
    declare getProducts: BelongsToManyGetAssociationsMixin<Product>;

    public async createCartForUser(): Promise<void> {
        await Cart.create({ customerId: this.id });
    }
}

Customer.init(
    {
        userId: {
            type: DataTypes.INTEGER,
            unique: true,
            references: {
                model: User,
                key: 'id',
            },
        },
        stripeId: {
            type: DataTypes.STRING,
        },
        shippingAddress: {
            type: DataTypes.STRING,
            defaultValue: 'none',
        },
        billingAddress: {
            type: DataTypes.STRING,
            defaultValue: 'none',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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
        modelName: 'Customer',
        tableName: 'customers',
    }
);

Customer.beforeCreate(async (customer: Customer) => {
    const { firstName, lastName, username, email, password } = customer;

    const user = await User.create({
        firstName,
        lastName,
        username,
        email,
        password,
    });

    customer.userId = user.id;
});

Customer.afterCreate(async (customer: Customer) => {
    await customer.createCartForUser();
});
