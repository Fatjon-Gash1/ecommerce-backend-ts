import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../config/db';

interface CountryAttributes {
    id?: number;
    name: string;
    rate: number;
}

interface CityAttributes {
    id?: number;
    countryId?: number;
    name: string;
    postalCode: number;
}

export class ShippingCountry extends Model<CountryAttributes> {
    declare id?: number;
    declare name: string;
    declare rate: number;
}

ShippingCountry.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        rate: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'shipping_countries',
        timestamps: false,
    }
);

export class ShippingCity extends Model<CityAttributes> {
    declare id?: number;
    declare countryId?: number;
    declare name: string;
    declare postalCode: number;
}

ShippingCity.init(
    {
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        postalCode: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, tableName: 'shipping_cities', timestamps: false }
);
