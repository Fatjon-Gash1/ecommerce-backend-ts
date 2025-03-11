import { DataTypes, Model, BelongsToManyGetAssociationsMixin } from 'sequelize';
import type {
    CreationOptional,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    NonAttribute,
} from 'sequelize';
import { sequelize } from '@/config/db';
import { User } from './User.model';
import { Cart } from './Cart.model';
import { Product } from './Product.model';
import { Order } from './Order.model';

export class Customer extends Model<
    InferAttributes<Customer>,
    InferCreationAttributes<Customer>
> {
    declare id: CreationOptional<number>;
    declare userId: ForeignKey<User['id']>;
    declare stripeId: string;
    declare stripePaymentMethodId: CreationOptional<string>;
    declare shippingAddress: CreationOptional<string>;
    declare billingAddress: CreationOptional<string>;
    declare isActive: CreationOptional<boolean>;
    declare loyaltyPoints: CreationOptional<number>;
    declare membership: CreationOptional<'free' | 'plus' | 'premium'>;
    declare birthday: CreationOptional<Date>;
    declare firstName: string; // Virtual field
    declare lastName: string; // Virtual field
    declare username: string; // Virtual field
    declare email: string; // Virtual field
    declare password: string; // Virtual field;
    declare user?: User;
    declare orders?: NonAttribute<Order[]>;

    // For reports
    declare getProducts: BelongsToManyGetAssociationsMixin<Product>;

    public async createCartForUser(): Promise<void> {
        await Cart.create({ customerId: this.id });
    }
}

Customer.init(
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
        stripeId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        stripePaymentMethodId: {
            type: DataTypes.STRING,
        },
        shippingAddress: {
            type: DataTypes.STRING,
        },
        billingAddress: {
            type: DataTypes.STRING,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        loyaltyPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        membership: {
            type: DataTypes.ENUM('free', 'plus', 'premium'),
            allowNull: false,
            defaultValue: 'free',
        },
        birthday: {
            type: DataTypes.DATE,
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
