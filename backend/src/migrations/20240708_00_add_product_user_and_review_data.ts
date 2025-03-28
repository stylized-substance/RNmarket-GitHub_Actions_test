import { products } from '../../data/data.json';
import { Product, Review, User } from '#src/types/types';
import { toProduct } from '#src/utils/typeNarrowers';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

// Migration in up direction is wrapped in an async function because we need to make an await call for admin user password hash
// @ts-expect-error - no type available for queryInterface
const migrateUp = async (queryInterface) => {
  const productArray: Product[] = [];
  const reviewArray: Review[] = [];
  const userArray: User[] = [];

  // Add admin user for testing purposes
  const password: string = 'password';
  const saltRounds: number = 12;
  const passwordHash: string = await bcrypt.hash(password, saltRounds);

  const adminUser: User = {
    id: uuidv4(),
    username: 'admin@example.org',
    name: 'admin',
    passwordhash: passwordHash,
    isadmin: true
  };

  userArray.push(adminUser);

  // Add regular user for testing purposes
  const testUser: User = {
    id: uuidv4(),
    username: 'test_user@example.org',
    name: 'test_user',
    passwordhash: await bcrypt.hash(password, saltRounds),
    isadmin: false
  };

  userArray.push(testUser);

  // Loop thorugh products
  // Pick product categories out of the data
  const categoriesToPick = ['Mobiles', 'Furniture', 'Laptops'];

  for (const product of products) {
    // Skip unwanted product categories
    if (!categoriesToPick.includes(product.category)) {
      continue;
    }

    const typeCheckedProduct: Product = toProduct(product);

    // Convert product price from Indian rupees to euros
    typeCheckedProduct.price =
      Math.round(typeCheckedProduct.price * 0.01 * 100) / 100;

    const productId: string = uuidv4();

    typeCheckedProduct.id = productId;

    if (typeCheckedProduct.reviews) {
      const { reviews, ...productWithoutReviews } = typeCheckedProduct;

      productArray.push(productWithoutReviews);

      // Loop through reviews and find all unique users
      for (const review of reviews) {
        // Create user object and save to array
        if (!userArray.find((user) => user.name === review.name)) {
          const user: User = {
            id: uuidv4(),
            username: `${review.name.replace(/\s/g, '')}@example.org`, // Remove whitespace from name
            name: review.name,
            passwordhash: null,
            isadmin: false
          };
          userArray.push(user);
        }
      }

      // Add user and products ids to reviews
      for (const review of reviews) {
        review.product_id = productId;
        review.id = uuidv4();
        const reviewUser = userArray.find((user) => user.name === review.name);
        if (reviewUser) {
          review.user_id = reviewUser.id;
        }
        reviewArray.push(review);
      }
    } else {
      productArray.push(typeCheckedProduct);
    }
  }

  await queryInterface.bulkInsert('users', userArray);
  await queryInterface.bulkInsert('products', productArray);
  await queryInterface.bulkInsert('reviews', reviewArray);
};

// @ts-expect-error - no type available for queryInterface
export const up = async ({ context: queryInterface }) => {
  await migrateUp(queryInterface);
};
// @ts-expect-error - no type available for queryInterface
export const down = async ({ context: queryInterface }) => {
  await queryInterface.bulkDelete('users');
  await queryInterface.bulkDelete('products');
  await queryInterface.bulkDelete('reviews');
};
