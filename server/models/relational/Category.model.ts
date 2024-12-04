import { DataTypes, Model, BelongsToManyGetAssociationsMixin } from 'sequelize';
import { sequelize } from '../../config/db';
import { Product } from './Product.model';

interface CategoryAttributes {
    id?: number;
    name: string;
    description: string;
    hasProducts?: boolean;
    parentId: number | null;
}

export class Category
    extends Model<CategoryAttributes>
    implements CategoryAttributes
{
    declare id?: number;
    declare name: string;
    declare description: string;
    declare hasProducts?: boolean;
    declare parentId: number | null;
    declare getProducts: BelongsToManyGetAssociationsMixin<Product>;
}

Category.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        hasProducts: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Category,
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: 'Category',
        tableName: 'categories',
        paranoid: true,
    }
);

Category.beforeDestroy(async (category, options) => {
    await Product.destroy({
        where: { categoryId: category.id },
        transaction: options.transaction,
    });
});
