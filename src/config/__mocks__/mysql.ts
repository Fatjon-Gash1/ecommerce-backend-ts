export const sequelize = {
    authenticate: jest.fn().mockResolvedValue(true),
    transaction: jest.fn(),
};
export const connectToMySQL = jest.fn();
