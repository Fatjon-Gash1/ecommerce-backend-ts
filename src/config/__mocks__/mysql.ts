const sequelize = {
    authenticate: jest.fn().mockResolvedValue(true),
    transaction: jest.fn(),
};
export const getSequelize = jest.fn().mockReturnValue(sequelize);
export const connectToMySQL = jest.fn();
