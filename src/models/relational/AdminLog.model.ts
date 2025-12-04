import { Model, DataTypes } from 'sequelize';
import { getSequelize } from '../../config/db';
const sequelize = getSequelize();

interface AdminLogAttributes {
    id?: number;
    adminId?: number;
    category: string;
    log: string;
}

export class AdminLog extends Model<AdminLogAttributes> {
    declare id?: number;
    declare adminId?: number;
    declare category: string;
    declare log: string;
}

AdminLog.init(
    {
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        log: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'AdminLog',
        tableName: 'admin_logs',
    }
);
