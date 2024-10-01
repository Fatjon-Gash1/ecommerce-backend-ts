import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/db';
import bcrypt from 'bcrypt';

interface UserAttributes {
    id?: number;
    profilePictureUrl?: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
}

export class User extends Model<UserAttributes> implements UserAttributes {
    declare id?: number;
    declare profilePictureUrl?: string;
    declare firstName: string;
    declare lastName: string;
    declare username: string;
    declare email: string;
    declare password: string;

    public async hashAndStorePassword(password: string): Promise<void> {
        const saltRounds = 10;
        this.password = await bcrypt.hash(password, saltRounds);
    }

    public async validatePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }
}

User.init(
    {
        profilePictureUrl: {
            type: DataTypes.STRING,
            allowNull: true,
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
        sequelize,
        modelName: 'User',
        tableName: 'users',
        paranoid: true,
    }
);

User.beforeCreate(async (user: User) => {
    await user.hashAndStorePassword(user.password);
});
