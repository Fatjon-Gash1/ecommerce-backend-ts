import { DataTypes, Model } from 'sequelize';
import type {
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '@/config/db';
import bcrypt from 'bcrypt';

export class User extends Model<
    InferAttributes<User>,
    InferCreationAttributes<User>
> {
    declare id: CreationOptional<number>;
    declare profilePictureUrl: CreationOptional<string>;
    declare firstName: string;
    declare lastName: string;
    declare username: string;
    declare email: string;
    declare password: string;
    declare isActive: CreationOptional<boolean>;
    declare lastLogin: CreationOptional<Date | string>;

    public async hashAndStorePassword(password: string): Promise<void> {
        const saltRounds = 12;
        this.password = await bcrypt.hash(password, saltRounds);
    }

    public async validatePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }
}

User.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
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
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        lastLogin: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
    }
);

User.beforeCreate(async (user: User) => {
    await user.hashAndStorePassword(user.password);
});
