import Product from './product';
import Review from './review';
import User from './user';
import RefreshToken from './refreshtoken';
import Order from './order';
import ProductOrder from './productorder';

Product.hasMany(Review, {
  // Automatically delete reviews when product is deleted
  onDelete: 'CASCADE'
});
Review.belongsTo(Product);

User.hasMany(Review, {
  // Automatically delete reviews when user is deleted
  onDelete: 'CASCADE'
});
Review.belongsTo(User);

User.hasMany(RefreshToken, {
  // Automatically delete refresh tokens when user is deleted
  onDelete: 'CASCADE'
});
RefreshToken.belongsTo(User);

Product.belongsToMany(Order, { through: ProductOrder });
Order.belongsToMany(Product, { through: ProductOrder });

export { Product, ProductOrder, Review, User, RefreshToken, Order };
