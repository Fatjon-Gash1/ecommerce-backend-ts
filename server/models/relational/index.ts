import { User } from './User.model';
import { Customer } from './Customer.model';
import { Admin } from './Admin.model';
import { AdminLog } from './AdminLog.model';
import { Category, SubCategory } from './Category.model';
import { Product } from './Product.model';
import { Cart, CartItem } from './Cart.model';
import { Order, OrderItem } from './Order.model';
import { Sale } from './Sale.model';
import { ShippingCountry, ShippingCity } from './ShippingCountry.model';
import { ShippingWeight, ShippingMethod } from './ShippingRate.model';
import { Payment } from './Payment.model';
import { Purchase } from './Purchases.model';

/* Model associations */

// Inherit from User model
Customer.belongsTo(User, {
    onDelete: 'CASCADE',
    foreignKey: {
        allowNull: false,
    },
});

Customer.hasOne(Cart);
Customer.hasMany(Order);
Customer.hasMany(Payment);
Customer.belongsToMany(Product, { through: Purchase });

// Inherit from User model
Admin.belongsTo(User, {
    onDelete: 'CASCADE',
    foreignKey: {
        allowNull: false,
    },
});

Admin.hasMany(AdminLog);

AdminLog.belongsTo(Admin);

Category.hasMany(SubCategory);
Category.hasMany(Product);

SubCategory.belongsTo(Category, { onDelete: 'CASCADE' });

Product.belongsTo(Category);
Product.hasOne(OrderItem);
Product.hasOne(CartItem);
Product.belongsToMany(Customer, { through: Purchase });

Cart.hasMany(CartItem);
Cart.belongsTo(Customer);

CartItem.belongsTo(Cart);
CartItem.belongsTo(Product);

ShippingCountry.hasMany(ShippingCity, { foreignKey: 'countryId' });
ShippingCity.belongsTo(ShippingCountry);

Payment.belongsTo(Customer);

Order.hasMany(OrderItem);
Order.belongsTo(Customer);
Order.hasOne(Sale);

OrderItem.belongsTo(Order);
OrderItem.belongsTo(Product);

Sale.belongsTo(Order);

/* End of associations */

export {
    User,
    Customer,
    Admin,
    AdminLog,
    Category,
    SubCategory,
    Product,
    Cart,
    CartItem,
    ShippingCountry,
    ShippingCity,
    ShippingWeight,
    ShippingMethod,
    Payment,
    Order,
    OrderItem,
    Sale,
    Purchase,
};
