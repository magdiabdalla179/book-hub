const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Order = require('./Order');
const Review = require('./Review');
const Payment = require('./Payment');
const Wishlist = require('./Wishlist');
const ChatHistory = require('./ChatHistory');

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlistItems' });
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(ChatHistory, { foreignKey: 'userId', as: 'chatHistories' });
ChatHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(Wishlist, { foreignKey: 'productId', as: 'wishlistEntries' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

module.exports = { User, Product, Category, Order, Review, Payment, Wishlist, ChatHistory };
