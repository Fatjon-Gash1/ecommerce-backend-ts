import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/db'; // Adjust the path based on your project structure

// Define the attributes for the User model
interface UserAttributes {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

// Define the creation attributes for the User model
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// Define the User model class
export class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes
{
    public id!: number;
    public firstName!: string;
    public lastName!: string;
    public username!: string;
    public email!: string;
    public password!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
    public deletedAt!: Date;

    // You can add other instance methods here if needed
}

// Initialize the User model
User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize, // Pass the Sequelize instance
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        paranoid: true,
    }
);
