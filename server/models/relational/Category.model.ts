import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/db';
import { Product } from './Product.model';

interface CategoryAttributes {
    id?: number;
    name: string;
    description: string;
    hasProducts?: boolean;
}

interface SubCategoryAttributes {
    id?: number;
    name: string;
    categoryId?: number;
}

export class Category
    extends Model<CategoryAttributes>
    implements CategoryAttributes
{
    declare id?: number;
    declare name: string;
    declare description: string;
    declare hasProducts?: boolean;
}

Category.init(
    {
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
    },
    { sequelize, modelName: 'Category', tableName: 'categories' }
);

export class SubCategory
    extends Model<SubCategoryAttributes>
    implements SubCategoryAttributes
{
    declare id?: number;
    declare name: string;
    declare categoryId?: number;
}
SubCategory.init(
    { name: { type: DataTypes.STRING, allowNull: false } },
    { sequelize, modelName: 'SubCategory', tableName: 'subcategories' }
);
