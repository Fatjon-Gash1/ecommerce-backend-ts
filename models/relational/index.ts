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
import { Purchase } from './Purchase.model';
import { Replenishment, ReplenishmentPayment } from './Replenishment.model';
import { RefundRequest } from './RefundRequest.model';
import { Notification } from './Notification.model';
import { Chatroom, Message, UserChatroom } from './Chatroom.model';

User.hasOne(Customer, {
    as: 'customer',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
});
User.hasOne(Admin, { as: 'admin', foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Notification, {
    as: 'notifications',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
});
User.belongsToMany(Chatroom, {
    through: UserChatroom,
    foreignKey: 'userId',
    otherKey: 'chatroomId',
});
User.hasMany(Message, { as: 'messages', foreignKey: 'senderId' });

Customer.belongsTo(User, {
    as: 'user',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
});

Customer.hasOne(Cart, {
    as: 'cart',
    foreignKey: 'customerId',
    onDelete: 'CASCADE',
});
Customer.hasMany(Order, { as: 'orders', foreignKey: 'customerId' });
Customer.hasMany(Payment, { foreignKey: 'customerId' });
Customer.belongsToMany(Product, {
    through: Purchase,
    foreignKey: 'customerId',
    otherKey: 'productId',
});
Customer.belongsToMany(Order, {
    through: Replenishment,
    foreignKey: 'customerId',
    otherKey: 'orderId',
});
Customer.hasMany(RefundRequest, {
    as: 'refundRequests',
    foreignKey: 'customerId',
});

Admin.belongsTo(User, {
    as: 'user',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
});

Admin.hasMany(AdminLog, { as: 'logs', foreignKey: 'adminId' });

AdminLog.belongsTo(Admin, { as: 'admin', foreignKey: 'adminId' });

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
Cart.belongsTo(Customer, {
    as: 'customer',
    foreignKey: 'customerId',
    onDelete: 'CASCADE',
});

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
Order.belongsTo(Customer, { as: 'customer', foreignKey: 'customerId' });
Order.hasOne(Sale, { foreignKey: 'orderId' });
Order.belongsToMany(Customer, {
    through: Replenishment,
    foreignKey: 'orderId',
    otherKey: 'customerId',
});
Order.hasOne(RefundRequest, { as: 'refundRequest', foreignKey: 'orderId' });

Sale.belongsTo(Order, { foreignKey: 'orderId' });

Replenishment.hasMany(ReplenishmentPayment, {
    as: 'payments',
    foreignKey: 'replenishmentId',
    onDelete: 'CASCADE',
});
ReplenishmentPayment.belongsTo(Replenishment, {
    as: 'replenishment',
    foreignKey: 'replenishmentId',
    onDelete: 'CASCADE',
});

RefundRequest.belongsTo(Customer, {
    as: 'customer',
    foreignKey: 'customerId',
});
RefundRequest.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });

Notification.belongsTo(User, {
    as: 'user',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
});

Chatroom.belongsToMany(User, {
    through: UserChatroom,
    foreignKey: 'chatroomId',
    otherKey: 'userId',
});
Chatroom.hasMany(Message, { as: 'messages', foreignKey: 'chatroomId' });

Message.belongsTo(Chatroom, {as: 'chatroom', foreignKey: 'chatroomId'});
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

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
    Replenishment,
    ReplenishmentPayment,
    RefundRequest,
    Notification,
};
