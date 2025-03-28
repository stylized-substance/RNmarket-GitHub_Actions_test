import supertest from 'supertest';
import app from '#src/app';
import {
  connectToDatabase,
  closeDatabaseConnection,
  dropAllTables
} from '#src/utils/database';
import {
  assert200Response,
  assert400Response,
  getToken,
  assert201Response
} from '#src/utils/testHelpers';
import { Order as OrderModel } from '#src/models';
import { Product as ProductModel } from '#src/models';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { OrderInDb } from '#src/types/types';

const api = supertest(app);

// Declare variables for access tokens
let userAccessToken: string;
let adminAccessToken: string;
let temporaryAccessToken: string;

beforeEach(async () => {
  // Empty database and run migrations
  await dropAllTables();
  await connectToDatabase();

  // Add test order to database
  const testOrder: OrderInDb = {
    id: uuidv4(),
    email: 'test@example.org',
    name: 'testname',
    address: 'testaddress',
    zipcode: '123',
    city: 'testcity',
    country: 'testcountry'
  };

  const product: ProductModel | null = await ProductModel.findOne({});

  const orderInDb: OrderModel | null = await OrderModel.create(testOrder);

  // @ts-expect-error - Sequelize model pecial methods/mixins don't seem to work with Typescript
  await orderInDb.addProduct(product, {
    through: { quantity: 1 }
  });

  // Define regular and admin users and get access tokens for them
  const user = {
    username: 'test_user@example.org',
    password: 'password'
  };
  const adminUser = {
    username: 'admin@example.org',
    password: 'password'
  };

  // Assign access tokens to global variables
  userAccessToken = await getToken(user);
  adminAccessToken = await getToken(adminUser);

  // Get a temporary access token for making order
  // Mock order for getting temporary access token
  const mockOrder = {
    products: [
      {
        id: 'id',
        quantity: 1
      }
    ],
    name: 'test_name',
    address: 'test_address'
  };
  const checkoutResponse = await api.post('/api/checkout').send(mockOrder);

  temporaryAccessToken = checkoutResponse.body.accessToken;
});

afterAll(async () => {
  await closeDatabaseConnection();
});

describe('GET requests', () => {
  test('GET - Admin user can get all orders from database', async () => {
    const response = await api
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    assert200Response(response);
    expect(response.body.orders).toHaveLength(1);
    expect(response.body.orders[0]).toHaveProperty('id');
    expect(response.body.orders[0]).toHaveProperty('email');
    expect(response.body.orders[0]).toHaveProperty('name');
    expect(response.body.orders[0]).toHaveProperty('address');
    expect(response.body.orders[0]).toHaveProperty('zipcode');
    expect(response.body.orders[0]).toHaveProperty('city');
    expect(response.body.orders[0]).toHaveProperty('createdAt');
    expect(response.body.orders[0]).toHaveProperty('updatedAt');
    expect(response.body.orders[0]).toHaveProperty('Products');
  });
  test('GET - Request fails for regular user', async () => {
    const response = await api
      .get('/api/orders')
      .set('Authorization', `Bearer ${userAccessToken}`);

    assert400Response(response);
    expect(response.body).toStrictEqual({
      Error: 'Only admin users can list orders'
    });
  });
});
describe('POST requests', () => {
  test('POST - A valid order can be added', async () => {
    // Get an in stock product from database for order
    const product: ProductModel | null = await ProductModel.findOne({
      where: {
        instock: {
          [Op.gt]: 0
        }
      }
    });

    const order = {
      products: [
        {
          id: product?.dataValues.id,
          quantity: 1
        }
      ],
      email: 'test@example.org',
      name: 'testname',
      address: 'testaddress',
      zipcode: '123',
      city: 'testcity',
      country: 'testcountry'
    };

    // Create new order
    const response = await api
      .post('/api/orders')
      .send(order)
      .set('Authorization', `Bearer ${temporaryAccessToken}`);

    assert201Response(response);
    expect(response.body).toHaveProperty('orderInDb');
  });
  test('POST - Request fails if trying to order a product with zero quantity', async () => {
    // Get an in stock product from database for order
    const product: ProductModel | null = await ProductModel.findOne({
      where: {
        instock: {
          [Op.gt]: 0
        }
      }
    });

    const order = {
      products: [
        {
          id: product?.dataValues.id,
          quantity: 0
        }
      ],
      email: 'test@example.org',
      name: 'testname',
      address: 'testaddress',
      zipcode: '123',
      city: 'testcity',
      country: 'testcountry'
    };

    // Create new order
    const response = await api
      .post('/api/orders')
      .send(order)
      .set('Authorization', `Bearer ${temporaryAccessToken}`);

    assert400Response(response);
    expect(response.body).toStrictEqual({
      Error: `You're trying to order product ${product?.dataValues.id} with quantity '0', order failed`
    });
  });
  test('POST - Request fails if trying to order inexistent product', async () => {
    // Create nonexistent product id
    const fakeId = uuidv4();

    const order = {
      products: [
        {
          id: fakeId,
          quantity: 1
        }
      ],
      email: 'test@example.org',
      name: 'testname',
      address: 'testaddress',
      zipcode: '123',
      city: 'testcity',
      country: 'testcountry'
    };

    // Create new order
    const response = await api
      .post('/api/orders')
      .send(order)
      .set('Authorization', `Bearer ${temporaryAccessToken}`);

    assert400Response(response);
    expect(response.body).toStrictEqual({
      Error: `One or more products not found in database, order failed.`
    });
  });
  test('POST - Request fails if any products are not in stock', async () => {
    // Get a not in stock product from database
    const notInStockProduct: ProductModel | null = await ProductModel.findOne({
      where: {
        instock: 0
      }
    });

    const order = {
      products: [
        {
          id: notInStockProduct?.dataValues.id,
          quantity: 1
        }
      ],
      email: 'test@example.org',
      name: 'testname',
      address: 'testaddress',
      zipcode: '123',
      city: 'testcity',
      country: 'testcountry'
    };

    // Create new order
    const response = await api
      .post('/api/orders')
      .send(order)
      .set('Authorization', `Bearer ${temporaryAccessToken}`);

    assert400Response(response);
    expect(response.body).toStrictEqual({
      Error: `Product ${notInStockProduct?.dataValues.id} not in stock, order failed`
    });
  });
  test('POST - Request fails if trying to order a larger quantity of product than there is in stock', async () => {
    // Get an in stock product from database for order
    const product: ProductModel | null = await ProductModel.findOne({
      where: {
        instock: {
          [Op.gt]: 0
        }
      }
    });

    const order = {
      products: [
        {
          id: product?.dataValues.id,
          quantity: product?.dataValues.instock + 1
        }
      ],
      email: 'test@example.org',
      name: 'testname',
      address: 'testaddress',
      zipcode: '123',
      city: 'testcity',
      country: 'testcountry'
    };

    // Create new order
    const response = await api
      .post('/api/orders')
      .send(order)
      .set('Authorization', `Bearer ${temporaryAccessToken}`);

    assert400Response(response);
    expect(response.body).toStrictEqual({
      Error: `Product ${product?.dataValues.id}: Not enough product in stock, order failed`
    });
  });
});
describe('DELETE queries', () => {
  test('DELETE - Admin user can delete an order', async () => {
    const order: OrderModel | null = await OrderModel.findOne();

    const response = await api
      .delete(`/api/orders/${order?.dataValues.id}`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(response.status).toBe(204);

    // Check that order was deleted from database
    const deletedOrder: OrderModel | null = await OrderModel.findByPk(
      `${order?.dataValues.id}`
    );
    expect(deletedOrder).toBeNull();
  });
  test('DELETE - Request fails for regular user', async () => {
    const order: OrderModel | null = await OrderModel.findOne();

    const response = await api
      .delete(`/api/orders/${order?.dataValues.id}`)
      .set('Authorization', `Bearer ${userAccessToken}`);

    assert400Response(response);
    expect(response.body).toStrictEqual({
      Error: 'Only admin users can delete orders'
    });
  });
  test('DELETE - Request fails if order is not found in database', async () => {
    const response = await api
      .delete(`/api/orders/${uuidv4()}`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      Error: 'Order not found'
    });
  });
});
