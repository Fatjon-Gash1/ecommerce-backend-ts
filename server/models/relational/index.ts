import { User } from './User.model';
import { Customer } from './Customer.model';
import { Admin } from './Admin.model';
import { AdminLog } from './AdminLog.model';
import { Category } from './Category.model';
import { Product } from './Product.model';
import { Cart, CartItem } from './Cart.model';
import { Order, OrderItem } from './Order.model';
import { Sale } from './Sale.model';
import { ShippingCountry, ShippingCity } from './ShippingCountry.model';
import { Payment } from './Payment.model';
import { Purchase } from './Purchases.model';

/* Model associations */

User.hasOne(Customer, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasOne(Admin, { foreignKey: 'userId', onDelete: 'CASCADE' });

// Inherit from User model
Customer.belongsTo(User, {
    as: 'user',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
});

Customer.hasOne(Cart, { foreignKey: 'customerId', onDelete: 'CASCADE' });
Customer.hasMany(Order, { foreignKey: 'customerId' });
Customer.hasMany(Payment, { foreignKey: 'customerId' });
Customer.belongsToMany(Product, {
    through: Purchase,
    foreignKey: 'customerId',
    otherKey: 'productId',
});

// Inherit from User model
Admin.belongsTo(User, {
    as: 'user',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
});

Admin.hasMany(AdminLog, { foreignKey: 'adminId' });

AdminLog.belongsTo(Admin, { foreignKey: 'adminId' });

Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
// Self-referential associations
Category.hasMany(Category, {
    as: 'children',
    foreignKey: 'parentId',
    onDelete: 'CASCADE',
});
Category.belongsTo(Category, {
    as: 'parent',
    foreignKey: 'parentId',
    onDelete: 'CASCADE',
});

Product.belongsTo(Category, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
Product.belongsToMany(Cart, {
    through: CartItem,
    foreignKey: 'productId',
    otherKey: 'cartId',
});
Product.belongsToMany(Order, {
    through: OrderItem,
    foreignKey: 'productId',
    otherKey: 'orderId',
});
Product.belongsToMany(Customer, {
    through: Purchase,
    foreignKey: 'productId',
    otherKey: 'customerId',
});

Cart.belongsToMany(Product, {
    through: CartItem,
    foreignKey: 'cartId',
    otherKey: 'productId',
});
Cart.belongsTo(Customer, { foreignKey: 'customerId', onDelete: 'CASCADE' });

ShippingCountry.hasMany(ShippingCity, {
    foreignKey: 'countryId',
    onDelete: 'CASCADE',
});
ShippingCity.belongsTo(ShippingCountry, {
    foreignKey: 'countryId',
    onDelete: 'CASCADE',
});

Payment.belongsTo(Customer, { foreignKey: 'customerId' });

Order.belongsToMany(Product, {
    through: OrderItem,
    foreignKey: 'orderId',
    otherKey: 'productId',
});
Order.belongsTo(Customer, { foreignKey: 'customerId' });
Order.hasOne(Sale, { foreignKey: 'orderId' });

Sale.belongsTo(Order, { foreignKey: 'orderId' });

/* End of associations */

export {
    User,
    Customer,
    Admin,
    AdminLog,
    Category,
    Product,
    Cart,
    CartItem,
    ShippingCountry,
    ShippingCity,
    Payment,
    Order,
    OrderItem,
    Sale,
    Purchase,
};
